import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, MessageCircle, Filter, Users, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiscoverScreenProps {
  userId: string;
  userType: 'student' | 'teacher';
  onMessageUser: (userId: string) => void;
}

interface Teacher {
  id: string;
  full_name: string;
  avatar_url: string | null;
  subjects: string[];
  location_city: string;
  rating: number;
  experience_years: number;
  distance_km?: number;
}

interface Student {
  id: string;
  full_name: string;
  avatar_url: string | null;
  education_level: string | null;
  subject_selections: string[] | null;
  location_city: string | null;
  distance_km?: number;
}

const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ userId, userType, onMessageUser }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDistance, setFilterDistance] = useState('50');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
    'History', 'Geography', 'Economics', 'Accounting', 'Computer Science'
  ];

  useEffect(() => {
    fetchUserLocation();
  }, [userId, userType]);

  useEffect(() => {
    if (userLocation) {
      fetchTeachers();
      if (userType === 'teacher') {
        fetchStudents();
      }
    }
  }, [userLocation, filterSubject, filterDistance]);

  const fetchUserLocation = async () => {
    try {
      if (userType === 'student') {
        const { data } = await supabase
          .from('students')
          .select('residence_lat, residence_lng')
          .eq('id', userId)
          .single();
        
        if (data?.residence_lat && data?.residence_lng) {
          setUserLocation({ lat: data.residence_lat, lng: data.residence_lng });
        } else {
          // Fallback to geolocation
          getCurrentPosition();
        }
      } else {
        const { data } = await supabase
          .from('teachers')
          .select('business_lat, business_lng')
          .eq('id', userId)
          .single();
        
        if (data?.business_lat && data?.business_lng) {
          setUserLocation({ lat: data.business_lat, lng: data.business_lng });
        } else {
          getCurrentPosition();
        }
      }
    } catch (error) {
      console.error('Error fetching user location:', error);
      getCurrentPosition();
    }
  };

  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          // Default to Harare if geolocation fails
          setUserLocation({ lat: -17.8252, lng: 31.0335 });
        }
      );
    } else {
      setUserLocation({ lat: -17.8252, lng: 31.0335 });
    }
  };

  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fetchTeachers = async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      let query = supabase
        .from('teachers')
        .select(`
          id, subjects, location_city, rating, experience_years, business_lat, business_lng,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('approved', true)
        .neq('id', userId);

      const { data, error } = await query;
      if (error) throw error;

      let result: Teacher[] = (data || []).map((t: any) => ({
        id: t.id,
        full_name: t.profiles.full_name,
        avatar_url: t.profiles.avatar_url,
        subjects: t.subjects || [],
        location_city: t.location_city,
        rating: t.rating || 4.5,
        experience_years: t.experience_years || 0,
        distance_km: t.business_lat && t.business_lng
          ? haversine(userLocation.lat, userLocation.lng, t.business_lat, t.business_lng)
          : undefined,
      }));

      // Filter by distance
      const maxDistance = parseInt(filterDistance);
      result = result.filter(t => !t.distance_km || t.distance_km <= maxDistance);

      // Filter by subject
      if (filterSubject !== 'all') {
        result = result.filter(t => 
          t.subjects.some(s => s.toLowerCase().includes(filterSubject.toLowerCase()))
        );
      }

      // Sort by distance
      result.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));

      setTeachers(result);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!userLocation) return;
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id, education_level, subject_selections, location_city, residence_lat, residence_lng,
          profiles!inner(full_name, avatar_url)
        `)
        .neq('id', userId);

      if (error) throw error;

      let result: Student[] = (data || []).map((s: any) => ({
        id: s.id,
        full_name: s.profiles.full_name,
        avatar_url: s.profiles.avatar_url,
        education_level: s.education_level,
        subject_selections: s.subject_selections,
        location_city: s.location_city,
        distance_km: s.residence_lat && s.residence_lng
          ? haversine(userLocation.lat, userLocation.lng, s.residence_lat, s.residence_lng)
          : undefined,
      }));

      // Filter by distance
      const maxDistance = parseInt(filterDistance);
      result = result.filter(s => !s.distance_km || s.distance_km <= maxDistance);

      // Sort by distance
      result.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));

      setStudents(result);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredStudents = students.filter(s =>
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTeacherCard = (teacher: Teacher) => (
    <div key={teacher.id} className="glass border-border/50 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="w-14 h-14">
          <AvatarImage src={teacher.avatar_url || undefined} />
          <AvatarFallback className="gradient-primary text-white text-lg">
            {teacher.full_name?.charAt(0) || 'T'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{teacher.full_name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{teacher.location_city}</span>
            {teacher.distance_km !== undefined && (
              <span className="text-primary">• {teacher.distance_km.toFixed(1)} km</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">{teacher.rating?.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              • {teacher.experience_years} yrs exp
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {teacher.subjects.slice(0, 3).map((subject, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {subject}
          </Badge>
        ))}
        {teacher.subjects.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{teacher.subjects.length - 3}
          </Badge>
        )}
      </div>

      <Button 
        className="w-full gradient-primary" 
        size="sm"
        onClick={() => onMessageUser(teacher.id)}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Send Message
      </Button>
    </div>
  );

  const renderStudentCard = (student: Student) => (
    <div key={student.id} className="glass border-border/50 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="w-14 h-14">
          <AvatarImage src={student.avatar_url || undefined} />
          <AvatarFallback className="gradient-secondary text-white text-lg">
            {student.full_name?.charAt(0) || 'S'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{student.full_name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{student.location_city || 'Location not set'}</span>
            {student.distance_km !== undefined && (
              <span className="text-primary">• {student.distance_km.toFixed(1)} km</span>
            )}
          </div>
          {student.education_level && (
            <p className="text-xs text-muted-foreground mt-1">
              {student.education_level}
            </p>
          )}
        </div>
      </div>

      {student.subject_selections && student.subject_selections.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {student.subject_selections.slice(0, 3).map((subject, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {subject}
            </Badge>
          ))}
          {student.subject_selections.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{student.subject_selections.length - 3}
            </Badge>
          )}
        </div>
      )}

      <Button 
        className="w-full" 
        variant="secondary"
        size="sm"
        onClick={() => onMessageUser(student.id)}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Send Message
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto space-y-3">
          <h1 className="text-2xl font-bold">Discover</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjectOptions.map(s => (
                  <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDistance} onValueChange={setFilterDistance}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
                <SelectItem value="100">100 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {userType === 'teacher' ? (
          <Tabs defaultValue="students" className="h-full flex flex-col">
            <div className="px-4 pt-2">
              <TabsList className="w-full max-w-lg mx-auto">
                <TabsTrigger value="students" className="flex-1">
                  <Users className="w-4 h-4 mr-2" />
                  Students
                </TabsTrigger>
                <TabsTrigger value="teachers" className="flex-1">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Teachers
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="students" className="flex-1 m-0">
              <ScrollArea className="h-full pb-20">
                <div className="max-w-lg mx-auto p-4 space-y-3">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-40 skeleton-shimmer rounded-xl" />
                    ))
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No students found nearby</p>
                    </div>
                  ) : (
                    filteredStudents.map(renderStudentCard)
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="teachers" className="flex-1 m-0">
              <ScrollArea className="h-full pb-20">
                <div className="max-w-lg mx-auto p-4 space-y-3">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-40 skeleton-shimmer rounded-xl" />
                    ))
                  ) : filteredTeachers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No teachers found</p>
                    </div>
                  ) : (
                    filteredTeachers.map(renderTeacherCard)
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <ScrollArea className="h-full pb-20">
            <div className="max-w-lg mx-auto p-4 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-40 skeleton-shimmer rounded-xl" />
                ))
              ) : filteredTeachers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No teachers found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                filteredTeachers.map(renderTeacherCard)
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default DiscoverScreen;
