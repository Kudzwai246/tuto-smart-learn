import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: any;
  currentUserId: string;
  onLike: (postId: string, currentlyLiked: boolean) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onLike }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  useEffect(() => {
    checkIfLiked();
  }, [post.id, currentUserId]);

  const checkIfLiked = async () => {
    try {
      const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
        .single();

      setIsLiked(!!data);
    } catch (error) {
      // Not liked
    }
  };

  const handleLike = () => {
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 400);
    setIsLiked(!isLiked);
    onLike(post.id, isLiked);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-border shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-primary/20">
            <AvatarImage src={post.profiles?.avatar_url} />
            <AvatarFallback className="gradient-primary text-white text-sm">
              {post.profiles?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{post.profiles?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground">
              {formatTimeAgo(post.created_at)}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="relative w-full aspect-square bg-muted">
          <img
            src={post.image_url}
            alt="Post content"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 touch-manipulation relative"
          >
            <Heart
              className={cn(
                "w-6 h-6 transition-all",
                isLiked ? "fill-destructive text-destructive" : "text-foreground",
                showLikeAnimation && "animate-like-pop"
              )}
            />
            {showLikeAnimation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Heart className="w-12 h-12 fill-destructive text-destructive opacity-0 animate-ping" />
              </div>
            )}
          </button>
          <button className="flex items-center gap-2 touch-manipulation">
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="flex items-center gap-2 touch-manipulation">
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        {/* Likes count */}
        {post.likes_count > 0 && (
          <p className="font-semibold text-sm">
            {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Content */}
        {post.content && (
          <div className="text-sm">
            <span className="font-semibold mr-2">{post.profiles?.full_name}</span>
            <span>{post.content}</span>
          </div>
        )}

        {/* Comments count */}
        {post.comments_count > 0 && (
          <button className="text-sm text-muted-foreground">
            View all {post.comments_count} comments
          </button>
        )}
      </div>
    </Card>
  );
};

export default PostCard;
