import React, { useState } from 'react';
import { X, Image as ImageIcon, Video } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreatePostSheetProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userType: string;
  onPostCreated: () => void;
}

const CreatePostSheet: React.FC<CreatePostSheetProps> = ({
  open,
  onClose,
  userId,
  userType,
  onPostCreated,
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async () => {
    if (!content.trim()) {
      toast.error('Please write something');
      return;
    }

    setLoading(true);
    try {
      const postType = userType === 'teacher' ? 'teacher_tip' : 'student_achievement';
      
      const { error } = await supabase.from('posts').insert({
        user_id: userId,
        content: content.trim(),
        post_type: postType,
      });

      if (error) throw error;

      toast.success('Post created successfully!');
      setContent('');
      onClose();
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Create Post</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none border-muted focus:border-primary"
            maxLength={500}
          />

          <div className="flex gap-4 text-muted-foreground">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Photo
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video
            </Button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePost}
              className="flex-1 gradient-primary"
              disabled={loading || !content.trim()}
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreatePostSheet;
