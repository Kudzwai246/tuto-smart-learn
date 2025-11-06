import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, BookOpen, MessageCircle, ArrowLeft, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StudentProfileViewProps {
  studentId: string;
  onBack: () => void;
  onMessage: (studentId: string) => void;
  currentUserId: string;
}

const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  studentId,
  onBack,
  onMessage,
  currentUserId
}) => {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentProfile();
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('id', studentId)
        .single();

      if (error) throw error;
      setStudent(data);
    } catch (error) {
      console.error('Error fetching student profile:', error);
      toast.error('Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="loading-skeleton w-16 h-16 rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass border-border/50 backdrop-blur-lg">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Student not found</p>
            <Button onClick={onBack} className="mt-4">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnProfile = currentUserId === studentId;

  return (
    <div className="min-h-screen gradient-bg pb-20">
      {/* Header */}
      <header className="glass border-b border-border/50 backdrop-blur-xl sticky top-0 z-40 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Student Profile</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="glass border-border/50 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-3xl font-bold">
                  {student.profiles?.full_name?.charAt(0) || 'S'}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-card border-2 border-border rounded-full p-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Name and Status */}
              <div>
                <h2 className="text-2xl font-bold">{student.profiles?.full_name}</h2>
                <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="mt-2">
                  {student.status}
                </Badge>
              </div>

              {/* Location (City only - no exact address for privacy) */}
              {student.location_city && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{student.location_city}</span>
                </div>
              )}

              {/* Connect Button */}
              {!isOwnProfile && (
                <Button
                  className="w-full gradient-primary"
                  onClick={() => onMessage(studentId)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Education Info */}
        <Card className="glass border-border/50 backdrop-blur-lg">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Education
            </h3>

            <div className="space-y-3">
              {student.education_level && (
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="font-medium">
                    {student.education_level.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </p>
                </div>
              )}

              {student.preferred_lesson_type && (
                <div>
                  <p className="text-sm text-muted-foreground">Preferred Lesson Type</p>
                  <p className="font-medium capitalize">{student.preferred_lesson_type.replace(/_/g, ' ')}</p>
                </div>
              )}

              {student.subject_selections && student.subject_selections.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {student.subject_selections.map((subject: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="glass border-border/50 backdrop-blur-lg border-primary/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              🔒 Sensitive information like guardian details and exact addresses are kept private for safety.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfileView;
