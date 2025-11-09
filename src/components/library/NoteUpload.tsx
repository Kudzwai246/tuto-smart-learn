import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { useUploadQuota } from '@/hooks/useUploadQuota';

interface NoteUploadProps {
  userId: string;
}

export const NoteUpload: React.FC<NoteUploadProps> = ({ userId }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    form: '',
    educationLevel: ''
  });
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const { quota, validateAndCheckQuota } = useUploadQuota(userId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, Word document, or text file');
        return;
      }

      // Validate file size and quota (20MB max per note)
      const validation = await validateAndCheckQuota(file, 'note', 20);
      if (!validation.valid) {
        return;
      }

      setNoteFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!noteFile) {
      toast.error('Please select a file');
      return;
    }

    if (!formData.title || !formData.subject || !formData.educationLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      // Upload file to storage
      const fileExt = noteFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('library-notes')
        .upload(fileName, noteFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(70);

      // Create database record
      const { error: dbError } = await supabase
        .from('library_notes')
        .insert({
          uploader_id: userId,
          title: formData.title,
          description: formData.description,
          file_path: `library-notes/${fileName}`,
          subject: formData.subject,
          form: formData.form,
          education_level: formData.educationLevel,
          file_type: noteFile.type,
          file_size_bytes: noteFile.size,
          status: 'pending' // Requires admin approval
        });

      if (dbError) throw dbError;

      setUploadProgress(100);

      toast.success('Notes uploaded successfully! Awaiting admin approval.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        form: '',
        educationLevel: ''
      });
      setNoteFile(null);
      const fileInput = document.getElementById('note-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload notes');
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
              <div>Notes: {quota.notes_count}/{quota.notes_limit}</div>
              <div>Storage: {quota.total_storage_mb.toFixed(0)}/{quota.storage_limit_mb} MB</div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="note-upload">File (PDF, DOC, TXT) *</Label>
            <div className="mt-2">
              <Input
                id="note-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {noteFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {noteFile.name} ({(noteFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Chemistry Revision Notes"
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
              placeholder="Describe the content..."
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
            {uploading ? 'Uploading...' : 'Upload Notes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
