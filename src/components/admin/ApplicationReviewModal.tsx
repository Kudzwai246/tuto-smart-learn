import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  GraduationCap, 
  MapPin, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download,
  ExternalLink,
  Award,
  BookOpen,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApplicationReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: any;
  onStatusUpdate: () => void;
}

export const ApplicationReviewModal: React.FC<ApplicationReviewModalProps> = ({
  open,
  onOpenChange,
  teacher,
  onStatusUpdate
}) => {
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    if (open && teacher) {
      fetchDocuments();
    }
  }, [open, teacher]);

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const { data, error } = await supabase
        .from('teacher_documents')
        .select('*')
        .eq('teacher_id', teacher.id);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoadingDocs(false);
    }
  };

  const downloadDocument = async (filePath: string, docType: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('teacher-docs')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${teacher.profiles.full_name}_${docType}_${Date.now()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Document downloaded');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const viewDocument = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('teacher-docs')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      if (data.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to view document');
    }
  };

  const handleApprove = async () => {
    if (!adminNotes.trim()) {
      toast.error('Please add admin notes before approving');
      return;
    }

    setIsLoading(true);
    try {
      // Update teacher status
      const { error: updateError } = await supabase
        .from('teachers')
        .update({
          status: 'approved',
          approved: true
        })
        .eq('id', teacher.id);

      if (updateError) throw updateError;

      // Update all documents to approved
      const { error: docsError } = await supabase
        .from('teacher_documents')
        .update({
          status: 'approved',
          admin_notes: adminNotes
        })
        .eq('teacher_id', teacher.id);

      if (docsError) throw docsError;

      // Send approval email
      try {
        await supabase.functions.invoke('send-notifications', {
          body: {
            notificationData: {
              recipientEmail: teacher.profiles.email,
              recipientName: teacher.profiles.full_name,
              notificationType: 'account_approved',
              title: 'Welcome Aboard! Your Tuto Teacher Account is Approved 🎉',
              message: 'Congratulations! Your application has been approved and you can now start teaching on Tuto.',
              additionalData: {
                fullName: teacher.profiles.full_name,
                subjects: teacher.subjects,
                city: teacher.location_city,
                experience: teacher.experience_years,
                adminNotes: adminNotes
              }
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      toast.success('Teacher approved successfully! Welcome email sent.');
      onStatusUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error approving teacher:', error);
      toast.error('Failed to approve teacher');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please select or provide a rejection reason');
      return;
    }

    setIsLoading(true);
    try {
      // Update teacher status
      const { error: updateError } = await supabase
        .from('teachers')
        .update({
          status: 'rejected',
          approved: false
        })
        .eq('id', teacher.id);

      if (updateError) throw updateError;

      // Update documents to rejected
      const { error: docsError } = await supabase
        .from('teacher_documents')
        .update({
          status: 'rejected',
          admin_notes: `${rejectionReason}\n\nAdmin Notes: ${adminNotes}`
        })
        .eq('teacher_id', teacher.id);

      if (docsError) throw docsError;

      // Send rejection email
      try {
        await supabase.functions.invoke('send-notifications', {
          body: {
            notificationData: {
              recipientEmail: teacher.profiles.email,
              recipientName: teacher.profiles.full_name,
              notificationType: 'account_rejected',
              title: 'Teacher Application Status Update',
              message: 'Thank you for your interest in becoming a Tuto teacher.',
              additionalData: {
                fullName: teacher.profiles.full_name,
                subjects: teacher.subjects,
                city: teacher.location_city,
                experience: teacher.experience_years,
                rejectionReason: rejectionReason
              }
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }

      toast.success('Application rejected. Notification email sent.');
      onStatusUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      toast.error('Failed to reject application');
    } finally {
      setIsLoading(false);
    }
  };

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] glass border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Teacher Application Review
          </DialogTitle>
          <DialogDescription>
            Review application details and uploaded documents
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="glass border-border/50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Full Name:</span>
                  <p className="font-medium">{teacher.profiles.full_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{teacher.profiles.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium">{teacher.profiles.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Application Date:</span>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(teacher.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="glass border-border/50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Professional Details
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-muted-foreground font-medium">Qualifications:</span>
                  <ul className="mt-2 space-y-1">
                    {teacher.qualifications?.map((qual: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                        <span>{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <span className="text-muted-foreground font-medium">Subjects:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {teacher.subjects?.map((subject: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-primary/10">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">Curriculum:</span>
                    <p className="font-medium capitalize">{teacher.curriculum}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Experience:
                    </span>
                    <p className="font-medium">{teacher.experience_years} years</p>
                  </div>
                </div>
                {teacher.teaching_methodology && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground font-medium">Teaching Methodology:</span>
                      <p className="mt-2 text-foreground">{teacher.teaching_methodology}</p>
                    </div>
                  </>
                )}
                {teacher.specializations && teacher.specializations.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground font-medium">Specializations:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {teacher.specializations.map((spec: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Location Details */}
            <div className="glass border-border/50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Address:</span>
                  <p className="font-medium">{teacher.location_address}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">City:</span>
                  <p className="font-medium">{teacher.location_city}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Teaching Location:</span>
                  <p className="font-medium capitalize">{teacher.lesson_location?.replace(/_/g, ' ')}</p>
                </div>
                {teacher.business_lat && teacher.business_lng && (
                  <div>
                    <span className="text-muted-foreground">GPS Coordinates:</span>
                    <p className="font-medium">
                      {teacher.business_lat.toFixed(5)}, {teacher.business_lng.toFixed(5)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="glass border-border/50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Uploaded Documents
              </h3>
              {loadingDocs ? (
                <p className="text-sm text-muted-foreground">Loading documents...</p>
              ) : documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium capitalize">{doc.doc_type}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDocument(doc.file_path)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(doc.file_path, doc.doc_type)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents uploaded</p>
              )}
            </div>

            {/* Admin Actions */}
            {teacher.status === 'pending' && (
              <div className="glass border-border/50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4">Admin Actions</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adminNotes">Admin Notes *</Label>
                    <Textarea
                      id="adminNotes"
                      placeholder="Add your review notes (visible to other admins)..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rejectionReason">Rejection Reason (if rejecting)</Label>
                    <Select onValueChange={setRejectionReason} value={rejectionReason}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="incomplete_qualifications">Incomplete or Insufficient Qualifications</SelectItem>
                        <SelectItem value="invalid_documents">Invalid or Unclear Documents</SelectItem>
                        <SelectItem value="insufficient_experience">Insufficient Teaching Experience</SelectItem>
                        <SelectItem value="location_restrictions">Location Restrictions</SelectItem>
                        <SelectItem value="duplicate_application">Duplicate Application</SelectItem>
                        <SelectItem value="other">Other (add in admin notes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleApprove}
                      disabled={isLoading || !adminNotes.trim()}
                      className="flex-1 gradient-primary"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Application
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={isLoading || !rejectionReason}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {teacher.status !== 'pending' && (
              <div className={`glass rounded-lg p-4 ${
                teacher.status === 'approved' 
                  ? 'bg-success/10 border-success/20' 
                  : 'bg-destructive/10 border-destructive/20'
              }`}>
                <p className="font-semibold flex items-center gap-2">
                  {teacher.status === 'approved' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-success" />
                      Application Approved
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-destructive" />
                      Application Rejected
                    </>
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(teacher.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
