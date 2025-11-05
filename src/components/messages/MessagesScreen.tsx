import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import ConversationView from './ConversationView';
import { cn } from '@/lib/utils';

interface MessagesScreenProps {
  userId: string;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ userId }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchConversations = async () => {
    try {
      const { data: convData } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_one_profile:participant_one (
            id,
            full_name,
            avatar_url,
            user_type
          ),
          participant_two_profile:participant_two (
            id,
            full_name,
            avatar_url,
            user_type
          ),
          messages (
            content,
            created_at,
            sender_id,
            status
          )
        `)
        .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (convData) {
        const enhanced = convData.map((conv) => {
          const otherUser =
            conv.participant_one === userId
              ? conv.participant_two_profile
              : conv.participant_one_profile;

          const lastMessage = conv.messages?.[0];
          const unreadCount = conv.messages?.filter(
            (m: any) => m.sender_id !== userId && m.status !== 'read'
          ).length || 0;

          return {
            ...conv,
            otherUser,
            lastMessage,
            unreadCount,
          };
        });

        setConversations(enhanced);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedConversation) {
    const conv = conversations.find((c) => c.id === selectedConversation);
    return (
      <ConversationView
        conversation={conv}
        currentUserId={userId}
        onBack={() => {
          setSelectedConversation(null);
          fetchConversations();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-4">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Messages</h1>
            <Button variant="ghost" size="icon">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Conversations List */}
      <ScrollArea className="flex-1 pb-16">
        <div className="max-w-md mx-auto">
          {loading ? (
            // Skeleton loaders
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border-b border-border">
                <div className="w-12 h-12 rounded-full skeleton-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 skeleton-shimmer rounded" />
                  <div className="h-3 w-48 skeleton-shimmer rounded" />
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-lg font-medium mb-2">No conversations</p>
              <p className="text-sm text-muted-foreground">
                Start chatting with teachers or students!
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className="w-full flex items-center gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors touch-manipulation"
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conv.otherUser?.avatar_url} />
                    <AvatarFallback className="gradient-primary text-white">
                      {conv.otherUser?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-card" />
                </div>

                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm truncate">
                      {conv.otherUser?.full_name || 'User'}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(conv.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "text-sm truncate",
                      conv.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                    )}>
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <Badge className="gradient-primary text-white ml-2">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessagesScreen;
