import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Eye, Video, FileText, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContentEarningsProps {
  userId: string;
}

export const ContentEarnings: React.FC<ContentEarningsProps> = ({ userId }) => {
  const [earnings, setEarnings] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
    fetchContent();
  }, [userId]);

  const fetchEarnings = async () => {
    try {
      const { data, error } = await supabase.rpc('get_creator_total_earnings', {
        _creator_id: userId
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setEarnings(data[0]);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings data');
    }
  };

  const fetchContent = async () => {
    try {
      // Fetch user's videos
      const { data: videosData } = await supabase
        .from('library_videos')
        .select('*')
        .eq('uploader_id', userId)
        .order('view_count', { ascending: false });

      // Fetch user's notes
      const { data: notesData } = await supabase
        .from('library_notes')
        .select('*')
        .eq('uploader_id', userId)
        .order('view_count', { ascending: false });

      setVideos(videosData || []);
      setNotes(notesData || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading earnings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${earnings?.total_earnings?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              From {earnings?.video_count || 0} videos & {earnings?.note_count || 0} notes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Earnings</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${earnings?.total_video_earnings?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              $0.2 per 100 views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Earnings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${earnings?.total_note_earnings?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              $0.2 per 1000 views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Videos */}
      {videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Your Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {videos.map((video) => {
                const videoEarnings = ((video.view_count || 0) / 100) * 0.2;
                return (
                  <div key={video.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{video.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{video.subject}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.view_count || 0} views
                        </span>
                        <Badge variant={video.status === 'approved' ? 'default' : 'outline'}>
                          {video.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        ${videoEarnings.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">earned</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Notes */}
      {notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notes.map((note) => {
                const noteEarnings = ((note.view_count || 0) / 1000) * 0.2;
                return (
                  <div key={note.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{note.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{note.subject}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {note.view_count || 0} views
                        </span>
                        <Badge variant={note.status === 'approved' ? 'default' : 'outline'}>
                          {note.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        ${noteEarnings.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">earned</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {videos.length === 0 && notes.length === 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Content Yet</h3>
            <p className="text-muted-foreground">
              Upload videos or notes to start earning!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
