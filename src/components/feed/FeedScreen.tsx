import React, { useState, useEffect } from 'react';
import { Plus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import TutoLogo from '@/components/TutoLogo';
import StoryBar from './StoryBar';
import PostCard from './PostCard';
import CreatePostSheet from './CreatePostSheet';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeedScreenProps {
  userId: string;
  userType: string;
  onShowDiscoverTeachers?: () => void;
  onShowStudentProfile?: (studentId: string) => void;
}

const FeedScreen: React.FC<FeedScreenProps> = ({ 
  userId, 
  userType,
  onShowDiscoverTeachers,
  onShowStudentProfile 
}) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            user_type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Set up realtime subscription
    const subscription = supabase
      .channel('posts_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    try {
      if (currentlyLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId });
      }
      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <TutoLogo size="sm" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCreatePost(true)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Stories */}
      <StoryBar userId={userId} />

      {/* Feed */}
      <ScrollArea className="flex-1 pb-20">
        <div className="max-w-md mx-auto px-4 space-y-4 py-4">
          {loading ? (
            // Skeleton loaders
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full skeleton-shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 skeleton-shimmer rounded" />
                    <div className="h-3 w-16 skeleton-shimmer rounded" />
                  </div>
                </div>
                <div className="h-40 skeleton-shimmer rounded-xl" />
                <div className="space-y-2">
                  <div className="h-3 skeleton-shimmer rounded" />
                  <div className="h-3 w-2/3 skeleton-shimmer rounded" />
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium mb-2">No posts yet</p>
              <p className="text-sm">Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={userId}
                onLike={handleLike}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* FAB */}
      <Button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full gradient-primary shadow-lg hover:shadow-xl z-40 transition-all duration-300 hover:scale-110"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Create Post Sheet */}
      <CreatePostSheet
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        userId={userId}
        userType={userType}
        onPostCreated={fetchPosts}
      />
    </div>
  );
};

export default FeedScreen;
