import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface StoryBarProps {
  userId: string;
}

const StoryBar: React.FC<StoryBarProps> = ({ userId }) => {
  const [stories, setStories] = useState<any[]>([]);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data: storiesData } = await supabase
        .from('stories')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          ),
          story_views!left (
            viewer_id
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (storiesData) {
        setStories(storiesData);
        const viewed = new Set(
          storiesData
            .filter((s) => s.story_views?.some((v: any) => v.viewer_id === userId))
            .map((s) => s.id)
        );
        setViewedStories(viewed);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const hasUserStory = stories.some((s) => s.user_id === userId);

  return (
    <div className="border-b border-border bg-card">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 p-4 max-w-md mx-auto">
          {/* Add Story Button */}
          <button className="flex flex-col items-center gap-2 min-w-[70px]">
            <div className="relative">
              <Avatar className="w-16 h-16 ring-2 ring-muted">
                <AvatarImage src="" />
                <AvatarFallback className="bg-muted">
                  <Plus className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              {!hasUserStory && (
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full gradient-primary flex items-center justify-center border-2 border-card">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-center">Your Story</span>
          </button>

          {/* Stories */}
          {stories.map((story) => (
            <button
              key={story.id}
              className="flex flex-col items-center gap-2 min-w-[70px]"
            >
              <Avatar
                className={cn(
                  "w-16 h-16 ring-2 transition-all",
                  viewedStories.has(story.id)
                    ? "ring-muted"
                    : "ring-primary"
                )}
              >
                <AvatarImage src={story.profiles?.avatar_url} />
                <AvatarFallback className="gradient-primary text-white">
                  {story.profiles?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-center truncate w-full">
                {story.profiles?.full_name || 'User'}
              </span>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default StoryBar;
