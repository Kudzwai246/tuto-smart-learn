import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { useUploadQuota } from '@/hooks/useUploadQuota';

interface VideoUploadProps {
  userId: string;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ userId }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    form: '',
    educationLevel: ''
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { quota, validateAndCheckQuota } = useUploadQuota(userId);

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
        toast.error('Please upload a valid video file (MP4, WebM, or MOV)');
        return;
      }

      // Validate file size and quota (100MB max per video)
      const validation = await validateAndCheckQuota(file, 'video', 100);
      if (!validation.valid) {
        return;
      }

      setVideoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!formData.title || !formData.subject || !formData.educationLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      // Upload video file to storage
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `library-videos/${fileName}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('library-videos')
        .upload(fileName, videoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(70);

      // Create database record
      const { error: dbError } = await supabase
        .from('library_videos')
        .insert({
          uploader_id: userId,
          title: formData.title,
          description: formData.description,
          file_path: filePath,
          subject: formData.subject,
          form: formData.form,
          education_level: formData.educationLevel,
          file_size_bytes: videoFile.size,
          status: 'pending' // Admin approval required
        });

      if (dbError) throw dbError;

      setUploadProgress(100);

      toast.success('Video uploaded successfully! Awaiting admin approval.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        form: '',
        educationLevel: ''
      });
      setVideoFile(null);
      const fileInput = document.getElementById('video-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {quota && (
          <div className="mb-4 p-3 glass rounded-lg border border-primary/20">
            <p className="text-sm font-medium mb-2">Upload Quota</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>Videos: {quota.videos_count}/{quota.videos_limit}</div>
              <div>Storage: {quota.total_storage_mb.toFixed(0)}/{quota.storage_limit_mb} MB</div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="video-upload">Video File *</Label>
            <div className="mt-2">
              <Input
                id="video-upload"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoChange}
                disabled={uploading}
              />
              {videoFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="title">Video Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Quadratic Equations Introduction"
              required
              disabled={uploading}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what students will learn..."
              rows={3}
              disabled={uploading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
                disabled={uploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Geography">Geography</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="form">Form</Label>
              <Select
                value={formData.form}
                onValueChange={(value) => setFormData({ ...formData, form: value })}
                disabled={uploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Form 1">Form 1</SelectItem>
                  <SelectItem value="Form 2">Form 2</SelectItem>
                  <SelectItem value="Form 3">Form 3</SelectItem>
                  <SelectItem value="Form 4">Form 4</SelectItem>
                  <SelectItem value="Form 5">Form 5</SelectItem>
                  <SelectItem value="Form 6">Form 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="educationLevel">Education Level *</Label>
            <Select
              value={formData.educationLevel}
              onValueChange={(value) => setFormData({ ...formData, educationLevel: value })}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Primary">Primary</SelectItem>
                <SelectItem value="O-Level">O-Level</SelectItem>
                <SelectItem value="A-Level">A-Level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-center text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <Button type="submit" disabled={uploading} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Video'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
