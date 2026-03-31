import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const getSessionId = () => {
  let sid = localStorage.getItem('chat_session_id');
  if (!sid) { sid = crypto.randomUUID(); localStorage.setItem('chat_session_id', sid); }
  return sid;
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [name, setName] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getSessionId());

  // Check existing conversation
  useEffect(() => {
    supabase.from('chat_conversations').select('*')
      .eq('session_id', sessionId.current).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setConversationId(data.id);
          setName(data.visitor_name);
          setStarted(true);
          loadMessages(data.id);
        }
      });
  }, []);

  const loadMessages = async (convId: string) => {
    const { data } = await supabase.from('chat_messages').select('*')
      .eq('conversation_id', convId).order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase.channel(`chat-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { data } = await supabase.from('chat_conversations')
      .insert({ visitor_name: name.trim(), session_id: sessionId.current })
      .select().single();
    if (data) {
      setConversationId(data.id);
      setStarted(true);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || sending) return;
    setSending(true);
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      sender_type: 'user',
      message: input.trim(),
    });
    setInput('');
    setSending(false);
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
    <div className="fixed bottom-5 right-5 z-50 w-80 sm:w-96 bg-card border rounded-xl shadow-2xl flex flex-col" style={{ height: '28rem' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-t-xl">
        <span className="font-semibold text-sm">লাইভ চ্যাট</span>
        <button onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
      </div>

      {!started ? (
        <form onSubmit={startChat} className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <p className="text-sm text-muted-foreground text-center">চ্যাট শুরু করতে আপনার নাম লিখুন</p>
          <Input placeholder="আপনার নাম" value={name} onChange={e => setName(e.target.value)} maxLength={100} />
          <Button type="submit" className="w-full">চ্যাট শুরু করুন</Button>
        </form>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
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
            <div ref={bottomRef} />
          </div>

          {/* Input */}
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
        </>
      )}
    </div>
  );
};

export default ChatWidget;
