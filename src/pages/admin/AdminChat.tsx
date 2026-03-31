import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, Volume2 } from 'lucide-react';
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

const AdminChat = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevConvCount = useRef(0);

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

  // Realtime: new conversations
  useEffect(() => {
    const ch = supabase.channel('admin-convs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_conversations' }, () => {
        notificationSound();
        loadConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // Realtime: new messages across all conversations
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
            <p className="text-sm font-medium">কথোপকথন ({conversations.length})</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y">
            {conversations.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between ${selected === c.id ? 'bg-primary/10' : ''}`}
              >
                <div>
                  <p className="font-medium text-sm">{c.visitor_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.updated_at).toLocaleString('bn-BD')}
                  </p>
                </div>
                {(unreadMap[c.id] || 0) > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5 font-bold">
                    {unreadMap[c.id]}
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
              <div className="px-4 py-3 border-b bg-muted/50 flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{selectedConv?.visitor_name}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                      m.sender_type === 'admin'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}>
                      {m.message}
                      <p className={`text-[10px] mt-1 ${m.sender_type === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(m.created_at).toLocaleTimeString('bn-BD')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendReply} className="flex items-center gap-2 p-3 border-t">
                <Input
                  placeholder="উত্তর লিখুন..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1"
                  maxLength={2000}
                />
                <Button type="submit" size="icon" disabled={sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
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
