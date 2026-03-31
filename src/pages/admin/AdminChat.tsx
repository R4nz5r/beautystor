import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, XCircle, Phone, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const notificationSound = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'এইমাত্র';
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ঘণ্টা আগে`;
  return `${Math.floor(hrs / 24)} দিন আগে`;
};

const AdminChat = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevConvCount = useRef(0);

  const activeCount = conversations.filter(c => c.status !== 'closed').length;

  const loadConversations = async () => {
    const { data } = await supabase.from('chat_conversations').select('*')
      .order('updated_at', { ascending: false });
    if (data) {
      if (prevConvCount.current > 0 && data.length > prevConvCount.current) {
        notificationSound();
      }
      prevConvCount.current = data.length;
      setConversations(data);
    }
  };

  const loadMessages = async (convId: string) => {
    const { data } = await supabase.from('chat_messages').select('*')
      .eq('conversation_id', convId).order('created_at', { ascending: true });
    if (data) setMessages(data);
    setUnreadMap(prev => ({ ...prev, [convId]: 0 }));
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    const ch = supabase.channel('admin-convs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => {
        loadConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    const ch = supabase.channel('admin-all-msgs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const msg = payload.new as any;
        if (msg.conversation_id === selected) {
          setMessages(prev => [...prev, msg]);
        }
        if (msg.sender_type === 'user') {
          notificationSound();
          if (msg.conversation_id !== selected) {
            setUnreadMap(prev => ({ ...prev, [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1 }));
          }
        }
        loadConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selected]);

  useEffect(() => {
    if (selected) loadMessages(selected);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    await supabase.from('chat_messages').insert({
      conversation_id: selected,
      sender_type: 'admin',
      message: input.trim(),
    });
    setInput('');
    setSending(false);
  };

  const endConversation = async (convId: string) => {
    await supabase.from('chat_conversations')
      .update({ status: 'closed' })
      .eq('id', convId);
    loadConversations();
  };

  const selectedConv = conversations.find(c => c.id === selected);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="h-6 w-6" /> লাইভ চ্যাট
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ height: '70vh' }}>
        {/* Conversation list */}
        <div className="bg-card border rounded-lg overflow-hidden flex flex-col">
          <div className="p-3 border-b bg-muted/50">
            <p className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              চ্যাট সেশন ({activeCount} সক্রিয়)
            </p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y">
            {conversations.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${selected === c.id ? 'bg-primary/10' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium text-sm">{c.visitor_name}</p>
                  </div>
                  {c.status === 'closed' ? (
                    <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">শেষ</span>
                  ) : (
                    <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">সক্রিয়</span>
                  )}
                </div>
                {(c as any).visitor_phone && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                    <Phone className="h-3 w-3" />
                    {(c as any).visitor_phone}
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(c.updated_at)}
                </p>
                {(unreadMap[c.id] || 0) > 0 && (
                  <span className="inline-block mt-1 bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5 font-bold">
                    {unreadMap[c.id]} নতুন
                  </span>
                )}
              </button>
            ))}
            {conversations.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">কোনো চ্যাট নেই</p>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="md:col-span-2 bg-card border rounded-lg flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="px-4 py-3 border-b bg-muted/50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{selectedConv?.visitor_name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {(selectedConv as any)?.visitor_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {(selectedConv as any).visitor_phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      শুরু: {new Date(selectedConv?.created_at).toLocaleString('bn-BD')}
                    </span>
                    {selectedConv?.status === 'closed' && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">শেষ হয়েছে</span>
                    )}
                  </div>
                </div>
                {selectedConv?.status !== 'closed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs h-8"
                    onClick={() => endConversation(selected)}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> চ্যাট বন্ধ করুন
                  </Button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div>
                      {m.sender_type === 'admin' && (
                        <p className="text-[10px] text-muted-foreground text-right mb-0.5">{selectedConv?.visitor_name}</p>
                      )}
                      {m.sender_type === 'user' && (
                        <p className="text-[10px] text-muted-foreground mb-0.5">অতিথি</p>
                      )}
                      <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                        m.sender_type === 'admin'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}>
                        {m.message}
                      </div>
                      <p className={`text-[10px] mt-0.5 ${m.sender_type === 'admin' ? 'text-right' : ''} text-muted-foreground`}>
                        {new Date(m.created_at).toLocaleTimeString('bn-BD')} {m.sender_type === 'admin' && '✓'}
                      </p>
                    </div>
                  </div>
                ))}
                {selectedConv?.status === 'closed' && (
                  <p className="text-center text-xs text-muted-foreground py-2">এই চ্যাট শেষ হয়েছে</p>
                )}
                <div ref={bottomRef} />
              </div>
              {selectedConv?.status !== 'closed' && (
                <form onSubmit={sendReply} className="flex items-center gap-2 p-3 border-t">
                  <Input
                    placeholder="উত্তর লিখুন..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-1"
                    maxLength={2000}
                  />
                  <Button type="submit" disabled={sending} className="gap-1">
                    <Send className="h-4 w-4" /> পাঠান
                  </Button>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              বাম পাশ থেকে একটি কথোপকথন সিলেক্ট করুন
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
