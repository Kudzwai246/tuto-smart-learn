import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NoteViewerProps {
  note: any;
  isOpen: boolean;
  onClose: () => void;
}

export const NoteViewer: React.FC<NoteViewerProps> = ({ note, isOpen, onClose }) => {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      const fileName = note.file_path.replace('library-notes/', '');
      const { data, error } = await supabase.storage
        .from('library-notes')
        .download(fileName);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${note.title}.${fileName.split('.').pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Download started!');

      // Increment download count
      await supabase
        .from('library_notes')
        .update({ download_count: (note.download_count || 0) + 1 })
        .eq('id', note.id);

    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{note.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center p-12 bg-gray-50 rounded-lg">
            <FileText className="w-24 h-24 text-gray-400" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>{note.subject}</Badge>
            {note.form && <Badge variant="outline">{note.form}</Badge>}
            <Badge variant="secondary">{note.education_level}</Badge>
          </div>

          {note.description && (
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{note.description}</p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {note.view_count || 0} views
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                {note.download_count || 0} downloads
              </div>
            </div>
            <span>Uploaded by {note.profiles?.full_name}</span>
          </div>

          <Button 
            onClick={handleDownload} 
            disabled={downloading}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? 'Downloading...' : 'Download File'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
