import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Download, Eye, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VideoPlayer } from './VideoPlayer';
import { NoteViewer } from './NoteViewer';

interface LibraryCatalogProps {
  contentType: 'video' | 'note';
  canView: boolean;
  userId: string;
}

export const LibraryCatalog: React.FC<LibraryCatalogProps> = ({ 
  contentType, 
  canView,
  userId 
}) => {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterForm, setFilterForm] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [selectedContent, setSelectedContent] = useState<any>(null);

  useEffect(() => {
    fetchContent();
  }, [contentType, filterForm, filterSubject]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const tableName = contentType === 'video' ? 'library_videos' : 'library_notes';
      
      let query = supabase
        .from(tableName)
        .select(`
          *,
          profiles!uploader_id(full_name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (filterForm !== 'all') {
        query = query.eq('form', filterForm);
      }

      if (filterSubject !== 'all') {
        query = query.eq('subject', filterSubject);
      }

      const { data, error } = await query;

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (item: any) => {
    if (!canView) {
      toast.error('You need an active subscription to view this content');
      return;
    }

    setSelectedContent(item);

    // Track view
    try {
      await supabase.from('library_views').insert({
        viewer_id: userId,
        content_type: contentType,
        content_id: item.id
      });

      // Increment view count
      const tableName = contentType === 'video' ? 'library_videos' : 'library_notes';
      await supabase
        .from(tableName)
        .update({ view_count: (item.view_count || 0) + 1 })
        .eq('id', item.id);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${contentType}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterForm} onValueChange={setFilterForm}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by Form" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Forms</SelectItem>
            <SelectItem value="Form 1">Form 1</SelectItem>
            <SelectItem value="Form 2">Form 2</SelectItem>
            <SelectItem value="Form 3">Form 3</SelectItem>
            <SelectItem value="Form 4">Form 4</SelectItem>
            <SelectItem value="Form 5">Form 5</SelectItem>
            <SelectItem value="Form 6">Form 6</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="Mathematics">Mathematics</SelectItem>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Science">Science</SelectItem>
            <SelectItem value="Physics">Physics</SelectItem>
            <SelectItem value="Chemistry">Chemistry</SelectItem>
            <SelectItem value="Biology">Biology</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No {contentType}s found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {contentType === 'video' && item.thumbnail_path && (
                  <div className="aspect-video bg-gray-100 rounded-md mb-3 relative overflow-hidden">
                    <img 
                      src={item.thumbnail_path} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="w-12 h-12 text-white opacity-80" />
                    </div>
                  </div>
                )}
                
                <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{item.subject}</Badge>
                  {item.form && <Badge variant="outline">{item.form}</Badge>}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {item.view_count || 0} views
                  </span>
                  <span>by {item.profiles?.full_name}</span>
                </div>

                <Button 
                  onClick={() => handleView(item)}
                  className="w-full"
                  variant={canView ? "default" : "outline"}
                >
                  {contentType === 'video' ? (
                    <><Play className="w-4 h-4 mr-2" /> Watch</>
                  ) : (
                    <><Download className="w-4 h-4 mr-2" /> Download</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedContent && contentType === 'video' && (
        <VideoPlayer
          video={selectedContent}
          isOpen={!!selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}

      {selectedContent && contentType === 'note' && (
        <NoteViewer
          note={selectedContent}
          isOpen={!!selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}
    </>
  );
};
