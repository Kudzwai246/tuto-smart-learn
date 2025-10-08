import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, Upload, TrendingUp } from 'lucide-react';
import { LibraryCatalog } from './LibraryCatalog';
import { VideoUpload } from './VideoUpload';
import { NoteUpload } from './NoteUpload';
import { ContentEarnings } from './ContentEarnings';

interface TutoLibraryProps {
  userType: 'student' | 'teacher' | 'admin';
  userId: string;
  hasActiveSubscription: boolean;
}

export const TutoLibrary: React.FC<TutoLibraryProps> = ({ 
  userType, 
  userId,
  hasActiveSubscription 
}) => {
  const [activeTab, setActiveTab] = useState('videos');

  const canUploadVideos = userType === 'teacher';
  const canUploadNotes = userType === 'student' || userType === 'teacher';
  const canViewContent = hasActiveSubscription || userType === 'teacher' || userType === 'admin';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Tuto Library
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Educational videos and notes organized by subject and form
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="videos">
                <Video className="w-4 h-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="notes">
                <BookOpen className="w-4 h-4 mr-2" />
                Notes
              </TabsTrigger>
              {canUploadVideos || canUploadNotes ? (
                <TabsTrigger value="upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </TabsTrigger>
              ) : null}
              {(canUploadVideos || canUploadNotes) && (
                <TabsTrigger value="earnings">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Earnings
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="videos" className="space-y-4">
              <LibraryCatalog
                contentType="video"
                canView={canViewContent}
                userId={userId}
              />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <LibraryCatalog
                contentType="note"
                canView={canViewContent}
                userId={userId}
              />
            </TabsContent>

            {(canUploadVideos || canUploadNotes) && (
              <TabsContent value="upload" className="space-y-4">
                {canUploadVideos && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Upload Tutorial Video</h3>
                    <VideoUpload userId={userId} />
                  </div>
                )}
                
                {canUploadNotes && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Upload Study Notes</h3>
                    <NoteUpload userId={userId} />
                  </div>
                )}
              </TabsContent>
            )}

            {(canUploadVideos || canUploadNotes) && (
              <TabsContent value="earnings" className="space-y-4">
                <ContentEarnings userId={userId} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {!canViewContent && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-orange-900 mb-2">
                Subscribe to Access Content
              </p>
              <p className="text-sm text-orange-700 mb-4">
                Get an active subscription to view and download educational materials
              </p>
              <Button className="bg-orange-600 hover:bg-orange-700">
                Browse Teachers
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
