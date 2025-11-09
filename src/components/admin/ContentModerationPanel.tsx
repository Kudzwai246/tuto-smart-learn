import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, FileText, Eye, Check, X, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  uploader_id: string;
  status: string;
  file_path: string;
  file_size_bytes: number;
  education_level: string;
  subject: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export const ContentModerationPanel = () => {
  const [pendingVideos, setPendingVideos] = useState<ContentItem[]>([]);
  const [pendingNotes, setPendingNotes] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState<ContentItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    try {
      const [videosRes, notesRes] = await Promise.all([
        supabase
          .from("library_videos")
          .select(`
            *,
            profiles!inner(full_name, email)
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        supabase
          .from("library_notes")
          .select(`
            *,
            profiles!inner(full_name, email)
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
      ]);

      setPendingVideos(videosRes.data || []);
      setPendingNotes(notesRes.data || []);
    } catch (error) {
      console.error("Error fetching pending content:", error);
      toast.error("Failed to load pending content");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: ContentItem, type: "video" | "note") => {
    const table = type === "video" ? "library_videos" : "library_notes";
    
    const { error } = await supabase
      .from(table)
      .update({ status: "approved" })
      .eq("id", item.id);

    if (error) {
      toast.error("Failed to approve content");
      return;
    }

    // Create notification
    await supabase.from("notifications").insert({
      user_id: item.uploader_id,
      title: "Content Approved! 🎉",
      message: `Your ${type} "${item.title}" has been approved and is now visible in the library.`,
      type: "success",
      metadata: { content_type: type, content_id: item.id },
    });

    toast.success(`${type} approved successfully`);
    setModalOpen(false);
    fetchPendingContent();
  };

  const handleReject = async (item: ContentItem, type: "video" | "note") => {
    const table = type === "video" ? "library_videos" : "library_notes";
    
    const { error } = await supabase
      .from(table)
      .update({ status: "rejected" })
      .eq("id", item.id);

    if (error) {
      toast.error("Failed to reject content");
      return;
    }

    // Create notification
    await supabase.from("notifications").insert({
      user_id: item.uploader_id,
      title: "Content Review Update",
      message: `Your ${type} "${item.title}" was not approved. ${reviewNotes || "Please review our content guidelines and try again."}`,
      type: "error",
      metadata: { content_type: type, content_id: item.id, admin_notes: reviewNotes },
    });

    toast.success(`${type} rejected`);
    setModalOpen(false);
    setReviewNotes("");
    fetchPendingContent();
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(2)} KB` : `${mb.toFixed(2)} MB`;
  };

  const ContentCard = ({ item, type }: { item: ContentItem; type: "video" | "note" }) => (
    <div className="p-4 border border-border/50 rounded-lg hover:border-primary/50 transition-colors bg-card/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {type === "video" ? (
              <Video className="h-4 w-4 text-primary" />
            ) : (
              <FileText className="h-4 w-4 text-primary" />
            )}
            <h3 className="font-semibold">{item.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>By: {item.profiles?.full_name}</span>
            <span>•</span>
            <span>{item.subject}</span>
            <span>•</span>
            <span>{item.education_level.replace(/_/g, " ")}</span>
            <span>•</span>
            <span>{formatFileSize(item.file_size_bytes)}</span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setReviewItem({ ...item, type } as any);
              setModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Review
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="glass border-border/50 backdrop-blur-lg">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading pending content...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass border-border/50 backdrop-blur-lg shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Content Moderation Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="videos">
            <TabsList className="glass border-border/50 backdrop-blur-lg">
              <TabsTrigger value="videos" className="data-[state=active]:gradient-primary">
                Videos ({pendingVideos.length})
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:gradient-primary">
                Notes ({pendingNotes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-4 mt-4">
              {pendingVideos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending videos to review
                </div>
              ) : (
                pendingVideos.map((video) => (
                  <ContentCard key={video.id} item={video} type="video" />
                ))
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-4">
              {pendingNotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending notes to review
                </div>
              ) : (
                pendingNotes.map((note) => (
                  <ContentCard key={note.id} item={note} type="note" />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass backdrop-blur-xl border-primary/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Content</DialogTitle>
          </DialogHeader>
          
          {reviewItem && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{reviewItem.title}</h3>
                <p className="text-sm text-muted-foreground">{reviewItem.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Uploader:</span>
                  <p className="font-medium">{reviewItem.profiles?.full_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Subject:</span>
                  <p className="font-medium">{reviewItem.subject}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Level:</span>
                  <p className="font-medium">{reviewItem.education_level.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">File Size:</span>
                  <p className="font-medium">{formatFileSize(reviewItem.file_size_bytes)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Admin Notes (for rejection)
                </label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes if rejecting content..."
                  className="glass"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setReviewNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => reviewItem && handleReject(reviewItem, (reviewItem as any).type)}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              className="gradient-primary"
              onClick={() => reviewItem && handleApprove(reviewItem, (reviewItem as any).type)}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
