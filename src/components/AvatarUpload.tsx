import React, { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  onAvatarUpdate: (url: string) => void;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  userId,
  currentAvatarUrl,
  onAvatarUpdate,
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onAvatarUpdate(data.publicUrl);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
        <AvatarImage src={currentAvatarUrl} alt="Profile" />
        <AvatarFallback className="text-xl bg-gradient-primary text-primary-foreground">
          <Camera className="h-8 w-8" />
        </AvatarFallback>
      </Avatar>
      
      <div className="absolute -bottom-2 -right-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 rounded-full p-0 bg-background border-2 border-background shadow-lg hover:shadow-xl transition-all"
          disabled={uploading}
        >
          <label className="cursor-pointer flex items-center justify-center w-full h-full">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </Button>
      </div>
    </div>
  );
};