import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { supabase } from '@/integrations/supabase/client';

interface VideoPlayerProps {
  video: any;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, isOpen, onClose }) => {
  const [videoUrl, setVideoUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (video && isOpen) {
      loadVideoUrl();
    }
  }, [video, isOpen]);

  const loadVideoUrl = async () => {
    try {
      const fileName = video.file_path.replace('library-videos/', '');
      const { data } = await supabase.storage
        .from('library-videos')
        .createSignedUrl(fileName, 3600); // 1 hour expiry

      if (data?.signedUrl) {
        setVideoUrl(data.signedUrl);
      }
    } catch (error) {
      console.error('Error loading video:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{video.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <AspectRatio ratio={16 / 9} className="bg-black rounded-lg overflow-hidden">
            {videoUrl ? (
              <video
                controls
                className="w-full h-full"
                src={videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white">Loading video...</p>
              </div>
            )}
          </AspectRatio>

          <div className="flex flex-wrap gap-2">
            <Badge>{video.subject}</Badge>
            {video.form && <Badge variant="outline">{video.form}</Badge>}
            <Badge variant="secondary">{video.education_level}</Badge>
          </div>

          {video.description && (
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{video.description}</p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {video.view_count || 0} views
            </span>
            <span>Uploaded by {video.profiles?.full_name}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
