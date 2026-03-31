import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateName, validatePhone } from '@/lib/validators';

const getSessionId = () => {
  let sid = localStorage.getItem('chat_session_id');
  if (!sid) { sid = crypto.randomUUID(); localStorage.setItem('chat_session_id', sid); }
  return sid;
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [ended, setEnded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    supabase.from('chat_conversations').select('*')
      .eq('session_id', sessionId.current).maybeSingle()
      .then(({ data }) => {
        if (data) {
          if (data.status === 'closed') {
            setEnded(true);
            setStarted(true);
            setConversationId(data.id);
            setName(data.visitor_name);
            loadMessages(data.id);
          } else {
            setConversationId(data.id);
            setName(data.visitor_name);
            setStarted(true);
            loadMessages(data.id);
          }
        }
      });
  }, []);

  const loadMessages = async (convId: string) => {
    const { data } = await supabase.from('chat_messages').select('*')
      .eq('conversation_id', convId).order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase.channel(`chat-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'chat_conversations',
        filter: `id=eq.${conversationId}`,
      }, (payload: any) => {
        if (payload.new?.status === 'closed') setEnded(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [chatErrors, setChatErrors] = useState<Record<string, string | null>>({});

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = {
      name: validateName(name),
      phone: validatePhone(phone, false),
    };
    setChatErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    const { data } = await supabase.from('chat_conversations')
      .insert({
        visitor_name: name.trim(),
        session_id: sessionId.current,
        visitor_phone: phone.trim() || null,
      } as any)
      .select().single();
    if (data) {
      setConversationId(data.id);
      setStarted(true);
      setEnded(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || sending || ended) return;
    setSending(true);
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      sender_type: 'user',
      message: input.trim(),
    });
    setInput('');
    setSending(false);
  };

  const endChat = async () => {
    if (!conversationId) return;
    await supabase.from('chat_conversations')
      .update({ status: 'closed' })
      .eq('id', conversationId);
    setEnded(true);
  };

  const startNewChat = () => {
    localStorage.removeItem('chat_session_id');
    sessionId.current = crypto.randomUUID();
    localStorage.setItem('chat_session_id', sessionId.current);
    setConversationId(null);
    setMessages([]);
    setStarted(false);
    setEnded(false);
    setName('');
    setPhone('');
    setInput('');
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 bg-primary text-primary-foreground rounded-full p-3.5 shadow-lg hover:shadow-xl transition-shadow"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 sm:w-96 bg-card border rounded-xl shadow-2xl flex flex-col" style={{ height: '30rem' }}>
      {/* Header */}
      <div className="flex flex-col rounded-t-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
          <span className="font-semibold text-sm">সাহায্য প্রয়োজন?</span>
          <div className="flex items-center gap-1">
            {started && !ended && (
              <button onClick={endChat} title="চ্যাট শেষ করুন" className="p-1 hover:bg-primary-foreground/20 rounded">
                <LogOut className="h-4 w-4" />
              </button>
            )}
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-primary-foreground/20 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        {!started && (
          <div className="bg-primary/90 text-primary-foreground px-4 pb-2 text-xs">
            আমরা আপনাকে সাহায্য করতে প্রস্তুত
          </div>
        )}
      </div>

      {!started ? (
        <form onSubmit={startChat} className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <div className="flex flex-col items-center gap-1 mb-2">
            <MessageCircle className="h-10 w-10 text-primary" />
            <p className="text-sm font-medium">চ্যাট শুরু করুন</p>
            <p className="text-xs text-muted-foreground">আপনার নাম দিয়ে চ্যাট শুরু করুন</p>
          </div>
          <div className="w-full space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block">আপনার নাম *</label>
              <Input placeholder="নাম লিখুন" value={name} onChange={e => { setName(e.target.value); setChatErrors(er => ({ ...er, name: null })); }} maxLength={100} />
              {chatErrors.name && <p className="text-xs text-destructive mt-1">{chatErrors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">ফোন নম্বর (ঐচ্ছিক)</label>
              <Input placeholder="01XXXXXXXXX" value={phone} onChange={e => { setPhone(e.target.value); setChatErrors(er => ({ ...er, phone: null })); }} maxLength={15} type="tel" />
              {chatErrors.phone && <p className="text-xs text-destructive mt-1">{chatErrors.phone}</p>}
            </div>
          </div>
          <Button type="submit" className="w-full">চ্যাট শুরু করুন</Button>
        </form>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && !ended && (
              <p className="text-xs text-muted-foreground text-center mt-8">আপনার মেসেজ পাঠান, আমরা শীঘ্রই উত্তর দেব!</p>
            )}
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                  m.sender_type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}>
                  {m.message}
                </div>
              </div>
            ))}
            {ended && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground mb-3">চ্যাট শেষ হয়েছে</p>
                <Button size="sm" variant="outline" onClick={startNewChat}>নতুন চ্যাট শুরু করুন</Button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          {!ended && (
            <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 border-t">
              <Input
                placeholder="মেসেজ লিখুন..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 text-sm"
                maxLength={2000}
              />
              <Button type="submit" size="icon" disabled={sending} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default ChatWidget;
