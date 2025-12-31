import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MoreVertical, Send, Paperclip, Camera, Smile, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import ChatBubble from './ChatBubble';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ConversationViewProps {
  conversation: any;
  currentUserId: string;
  onBack: () => void;
  isOtherUserOnline?: boolean;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  currentUserId,
  onBack,
  isOtherUserOnline = false,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      markMessagesAsRead();

      // Subscribe to new messages
      const messageSubscription = supabase
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
            // Mark as read if from other user
            if (payload.new.sender_id !== currentUserId) {
              markMessagesAsRead();
            }
          }
        )
        .subscribe();

      // Subscribe to typing indicator
      const typingChannel = supabase.channel(`typing_${conversation.id}`);
      typingChannel
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
          if (payload.user_id !== currentUserId) {
            setIsTyping(true);
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
          }
        })
        .subscribe();

      return () => {
        messageSubscription.unsubscribe();
        typingChannel.unsubscribe();
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
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
        .in('status', ['sent', 'delivered']);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const broadcastTyping = async () => {
    try {
      const channel = supabase.channel(`typing_${conversation.id}`);
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: currentUserId },
      });
    } catch (error) {
      // Silently fail typing indicator
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    broadcastTyping();
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistic update
    const optimisticMessage = {
      id: `temp_${Date.now()}`,
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content: messageContent,
      status: 'sending',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      const { data, error } = await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: currentUserId,
        content: messageContent,
        status: 'sent',
      }).select().single();

      if (error) throw error;

      // Replace optimistic message with real one
      setMessages((prev) => 
        prev.map((m) => (m.id === optimisticMessage.id ? data : m))
      );

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setNewMessage(messageContent);
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
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser?.avatar_url} />
              <AvatarFallback className="gradient-primary text-white">
                {otherUser?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
              isOtherUserOnline ? "bg-success" : "bg-muted-foreground"
            )} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{otherUser?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground">
              {isTyping ? (
                <span className="text-primary animate-pulse">typing...</span>
              ) : isOtherUserOnline ? (
                'Online'
              ) : (
                'Offline'
              )}
            </p>
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
          {isTyping && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
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
              onChange={handleInputChange}
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
