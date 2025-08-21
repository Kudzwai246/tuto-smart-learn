import React, { useState, useEffect } from 'react';
import { Star, MapPin, BookOpen, Award, Clock, MessageSquare, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

interface TeacherProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  rating: number;
  experience_years: number;
  price_usd: number;
  location_city: string;
  lesson_location: string;
  teaching_methodology: string;
  specializations: string[];
  qualification_details: any[];
  availability_schedule: any;
  subjects: string[];
}

interface TeacherRating {
  rating: number;
  teaching_quality: number;
  communication: number;
  punctuality: number;
  subject_knowledge: number;
  comment: string;
  created_at: string;
  student_name: string;
}

interface TeacherProfileEnhancedProps {
  teacherId: string;
  showContactButton?: boolean;
  onContact?: () => void;
}

export const TeacherProfileEnhanced: React.FC<TeacherProfileEnhancedProps> = ({
  teacherId,
  showContactButton = false,
  onContact
}) => {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [ratings, setRatings] = useState<TeacherRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherProfile();
    fetchTeacherRatings();
  }, [teacherId]);

  const fetchTeacherProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id,
          rating,
          experience_years,
          price_usd,
          location_city,
          lesson_location,
          teaching_methodology,
          specializations,
          qualification_details,
          availability_schedule,
          subjects,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('id', teacherId)
        .eq('approved', true)
        .single();

      if (error) throw error;

      setTeacher({
        ...data,
        full_name: (data.profiles as any).full_name,
        avatar_url: (data.profiles as any).avatar_url
      });
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
    }
  };

  const fetchTeacherRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          rating,
          teaching_quality,
          communication,
          punctuality,
          subject_knowledge,
          comment,
          created_at,
          profiles!ratings_student_id_fkey(full_name)
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setRatings(data.map(rating => ({
        ...rating,
        student_name: (rating.profiles as any)?.full_name || 'Anonymous'
      })));
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  if (loading) {
    return <div className="animate-pulse bg-muted rounded-lg h-96"></div>;
  }

  if (!teacher) {
    return <div className="text-center text-muted-foreground">Teacher not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 border-4 border-white/20">
              <AvatarImage src={teacher.avatar_url} alt={teacher.full_name} />
              <AvatarFallback className="text-xl bg-white/20">
                {teacher.full_name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{teacher.full_name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  {renderStars(teacher.rating)}
                  <span className="text-sm font-medium">
                    {teacher.rating.toFixed(1)} ({ratings.length} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  {teacher.experience_years} years experience
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {teacher.location_city}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${teacher.price_usd}</div>
              <div className="text-sm opacity-90">per month</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Subjects */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Subjects
            </h3>
            <div className="flex flex-wrap gap-2">
              {teacher.subjects?.map((subject, index) => (
                <Badge key={index} variant="secondary">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>

          {/* Specializations */}
          {teacher.specializations?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {teacher.specializations.map((spec, index) => (
                  <Badge key={index} variant="outline">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Teaching Methodology */}
          {teacher.teaching_methodology && (
            <div>
              <h3 className="font-semibold mb-2">Teaching Approach</h3>
              <p className="text-muted-foreground">{teacher.teaching_methodology}</p>
            </div>
          )}

          {/* Qualifications */}
          {teacher.qualification_details?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Qualifications
              </h3>
              <div className="space-y-2">
                {teacher.qualification_details.map((qual, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">{qual.degree || qual.title}</div>
                    {qual.institution && (
                      <div className="text-sm text-muted-foreground">{qual.institution}</div>
                    )}
                    {qual.year && (
                      <div className="text-sm text-muted-foreground">{qual.year}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lesson Location */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lesson Location
            </h3>
            <Badge variant="outline">{teacher.lesson_location}</Badge>
          </div>

          {showContactButton && (
            <div className="pt-4">
              <Button 
                onClick={onContact}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                Contact Teacher
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      {ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ratings.map((rating, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{rating.student_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(rating.rating)}
                  </div>
                </div>

                {/* Detailed Ratings */}
                {(rating.teaching_quality || rating.communication || rating.punctuality || rating.subject_knowledge) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {rating.teaching_quality && (
                      <div>
                        <div className="text-muted-foreground">Teaching</div>
                        <div className="flex items-center gap-1">
                          {renderStars(rating.teaching_quality)}
                        </div>
                      </div>
                    )}
                    {rating.communication && (
                      <div>
                        <div className="text-muted-foreground">Communication</div>
                        <div className="flex items-center gap-1">
                          {renderStars(rating.communication)}
                        </div>
                      </div>
                    )}
                    {rating.punctuality && (
                      <div>
                        <div className="text-muted-foreground">Punctuality</div>
                        <div className="flex items-center gap-1">
                          {renderStars(rating.punctuality)}
                        </div>
                      </div>
                    )}
                    {rating.subject_knowledge && (
                      <div>
                        <div className="text-muted-foreground">Knowledge</div>
                        <div className="flex items-center gap-1">
                          {renderStars(rating.subject_knowledge)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {rating.comment && (
                  <p className="text-muted-foreground italic">"{rating.comment}"</p>
                )}

                {index < ratings.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};