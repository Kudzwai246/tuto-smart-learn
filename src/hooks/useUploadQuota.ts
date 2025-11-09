import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UploadQuota {
  videos_count: number;
  notes_count: number;
  total_storage_mb: number;
  videos_limit: number;
  notes_limit: number;
  storage_limit_mb: number;
}

interface QuotaCheck {
  allowed: boolean;
  reason?: string;
  remaining_videos?: number;
  remaining_notes?: number;
  remaining_storage_mb?: number;
  current?: number;
  limit?: number;
}

export const useUploadQuota = (userId: string | null) => {
  const [quota, setQuota] = useState<UploadQuota | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchQuota();
    }
  }, [userId]);

  const fetchQuota = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("upload_quotas")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching quota:", error);
        return;
      }

      setQuota(data || {
        videos_count: 0,
        notes_count: 0,
        total_storage_mb: 0,
        videos_limit: 10,
        notes_limit: 20,
        storage_limit_mb: 500,
      });
    } catch (error) {
      console.error("Error in fetchQuota:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkQuota = async (
    contentType: "video" | "note",
    fileSizeMB: number
  ): Promise<QuotaCheck> => {
    if (!userId) {
      return { allowed: false, reason: "User not authenticated" };
    }

    try {
      const { data, error } = await supabase.rpc("check_upload_quota", {
        _user_id: userId,
        _content_type: contentType,
        _file_size_mb: fileSizeMB,
      });

      if (error) {
        console.error("Error checking quota:", error);
        return { allowed: false, reason: "Failed to check quota" };
      }

      return data as QuotaCheck;
    } catch (error) {
      console.error("Error in checkQuota:", error);
      return { allowed: false, reason: "Failed to check quota" };
    }
  };

  const validateAndCheckQuota = async (
    file: File,
    contentType: "video" | "note",
    maxSizeMB: number = 100
  ): Promise<{ valid: boolean; error?: string }> => {
    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      const error = `File size (${fileSizeMB.toFixed(2)} MB) exceeds the maximum allowed size of ${maxSizeMB} MB`;
      toast.error(error);
      return { valid: false, error };
    }

    // Check quota
    const quotaResult = await checkQuota(contentType, fileSizeMB);
    if (!quotaResult.allowed) {
      toast.error(quotaResult.reason || "Upload quota exceeded");
      return { valid: false, error: quotaResult.reason };
    }

    return { valid: true };
  };

  return {
    quota,
    loading,
    fetchQuota,
    checkQuota,
    validateAndCheckQuota,
  };
};
