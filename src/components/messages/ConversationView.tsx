import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MoreVertical, Send, Paperclip, Camera, Smile, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import ChatBubble from './ChatBubble';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConversationViewProps {
  conversation: any;
  currentUserId: string;
  onBack: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  currentUserId,
  onBack,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      markMessagesAsRead();

      // Subscribe to new messages
      const subscription = supabase
        .channel(`conversation_${conversation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversation.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [conversation]);

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('conversation_id', conversation.id)
        .neq('sender_id', currentUserId)
        .eq('status', 'delivered');
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: currentUserId,
        content: newMessage.trim(),
        status: 'sent',
      });

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherUser = conversation?.otherUser;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser?.avatar_url} />
            <AvatarFallback className="gradient-primary text-white">
              {otherUser?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{otherUser?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4 pb-24">
        <div className="max-w-md mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
              />
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4 mobile-safe-area">
        <div className="max-w-md mx-auto flex items-end gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Camera className="w-5 h-5" />
          </Button>

          <div className="flex-1 relative">
            <Textarea
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[44px] max-h-[120px] resize-none pr-10"
              rows={1}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 bottom-1 h-8 w-8"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          {newMessage.trim() ? (
            <Button
              onClick={handleSend}
              disabled={sending}
              className="shrink-0 gradient-primary"
              size="icon"
            >
              <Send className="w-5 h-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="shrink-0">
              <Mic className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationView;
