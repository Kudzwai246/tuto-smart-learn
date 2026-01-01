import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Star, MessageCircle, Users, GraduationCap, BookOpen } from 'lucide-react';
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
  curriculum: string | null;
  location_city: string;
  rating: number;
  experience_years: number;
  distance_km?: number;
}

interface Connection {
  id: string;
  full_name: string;
  avatar_url: string | null;
  user_type: string | null;
  education_level: string | null;
  subject_selections: string[] | null;
  location_city: string | null;
  distance_km?: number;
}

const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ userId, userType, onMessageUser }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDistance, setFilterDistance] = useState('100');
  const [filterCurriculum, setFilterCurriculum] = useState('all');
  const [filterEducation, setFilterEducation] = useState('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeTab, setActiveTab] = useState('teachers');

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
    'History', 'Geography', 'Economics', 'Accounting', 'Computer Science',
    'Business Studies', 'Literature', 'Shona', 'French'
  ];

  const curriculumOptions = [
    { value: 'all', label: 'All Curricula' },
    { value: 'zimsec', label: 'ZIMSEC' },
    { value: 'cambridge', label: 'Cambridge' },
    { value: 'both', label: 'Both' },
  ];

  const educationOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'o-level', label: 'O-Level' },
    { value: 'a-level', label: 'A-Level' },
    { value: 'primary', label: 'Primary' },
  ];

  useEffect(() => {
    fetchUserLocation();
  }, [userId, userType]);

  useEffect(() => {
    if (userLocation) {
      fetchTeachers();
      fetchConnections();
    }
  }, [userLocation, filterSubject, filterDistance, filterCurriculum, filterEducation]);

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
          return;
        }
      } else {
        const { data } = await supabase
          .from('teachers')
          .select('business_lat, business_lng')
          .eq('id', userId)
          .single();
        
        if (data?.business_lat && data?.business_lng) {
          setUserLocation({ lat: data.business_lat, lng: data.business_lng });
          return;
        }
      }
      getCurrentPosition();
    } catch (error) {
      console.error('Error fetching user location:', error);
      getCurrentPosition();
    }
  };

  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: -17.8252, lng: 31.0335 })
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
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id, subjects, curriculum, location_city, rating, experience_years, business_lat, business_lng,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('approved', true)
        .neq('id', userId);

      if (error) throw error;

      let result: Teacher[] = (data || []).map((t: any) => ({
        id: t.id,
        full_name: t.profiles.full_name,
        avatar_url: t.profiles.avatar_url,
        subjects: t.subjects || [],
        curriculum: t.curriculum,
        location_city: t.location_city,
        rating: t.rating || 4.5,
        experience_years: t.experience_years || 0,
        distance_km: t.business_lat && t.business_lng
          ? haversine(userLocation.lat, userLocation.lng, t.business_lat, t.business_lng)
          : undefined,
      }));

      // Apply filters
      const maxDistance = parseInt(filterDistance);
      result = result.filter(t => !t.distance_km || t.distance_km <= maxDistance);

      if (filterSubject !== 'all') {
        result = result.filter(t => 
          t.subjects.some(s => s.toLowerCase().includes(filterSubject.toLowerCase()))
        );
      }

      if (filterCurriculum !== 'all') {
        result = result.filter(t => {
          if (!t.curriculum) return true;
          const curr = t.curriculum.toLowerCase();
          if (filterCurriculum === 'both') return curr.includes('both') || curr.includes('zimsec') && curr.includes('cambridge');
          return curr.includes(filterCurriculum);
        });
      }

      result.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
      setTeachers(result);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    if (!userLocation) return;
    try {
      // Fetch all users except current user (students and other teachers)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_type')
        .neq('id', userId)
        .neq('user_type', 'admin');

      if (profilesError) throw profilesError;

      // Fetch student details
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, education_level, subject_selections, location_city, residence_lat, residence_lng');

      const studentMap = new Map((studentsData || []).map(s => [s.id, s]));

      let result: Connection[] = (profilesData || []).map((p: any) => {
        const studentInfo = studentMap.get(p.id);
        let distance_km: number | undefined;
        
        if (studentInfo?.residence_lat && studentInfo?.residence_lng) {
          distance_km = haversine(userLocation.lat, userLocation.lng, studentInfo.residence_lat, studentInfo.residence_lng);
        }

        return {
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          user_type: p.user_type,
          education_level: studentInfo?.education_level || null,
          subject_selections: studentInfo?.subject_selections || null,
          location_city: studentInfo?.location_city || null,
          distance_km,
        };
      });

      // Filter out teachers (they show in teachers tab)
      result = result.filter(c => c.user_type !== 'teacher');

      // Apply distance filter
      const maxDistance = parseInt(filterDistance);
      result = result.filter(c => !c.distance_km || c.distance_km <= maxDistance);

      // Apply education level filter
      if (filterEducation !== 'all') {
        result = result.filter(c => {
          if (!c.education_level) return true;
          const level = c.education_level.toLowerCase();
          return level.includes(filterEducation);
        });
      }

      result.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
      setConnections(result);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleMessage = useCallback((targetId: string) => {
    onMessageUser(targetId);
  }, [onMessageUser]);

  const filteredTeachers = teachers.filter(t =>
    t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredConnections = connections.filter(c =>
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <span className="truncate">{teacher.location_city || 'Location not set'}</span>
            {teacher.distance_km !== undefined && (
              <span className="text-primary shrink-0">• {teacher.distance_km.toFixed(1)} km</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{teacher.rating?.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground">• {teacher.experience_years} yrs</span>
            {teacher.curriculum && (
              <Badge variant="outline" className="text-xs">
                {teacher.curriculum}
              </Badge>
            )}
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
        onClick={() => handleMessage(teacher.id)}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Send Message
      </Button>
    </div>
  );

  const renderConnectionCard = (connection: Connection) => (
    <div key={connection.id} className="glass border-border/50 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="w-14 h-14">
          <AvatarImage src={connection.avatar_url || undefined} />
          <AvatarFallback className="gradient-secondary text-white text-lg">
            {connection.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{connection.full_name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{connection.location_city || 'Location not set'}</span>
            {connection.distance_km !== undefined && (
              <span className="text-primary shrink-0">• {connection.distance_km.toFixed(1)} km</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs capitalize">
              {connection.user_type || 'Student'}
            </Badge>
            {connection.education_level && (
              <Badge variant="secondary" className="text-xs">
                {connection.education_level}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {connection.subject_selections && connection.subject_selections.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {connection.subject_selections.slice(0, 3).map((subject, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {subject}
            </Badge>
          ))}
          {connection.subject_selections.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{connection.subject_selections.length - 3}
            </Badge>
          )}
        </div>
      )}

      <Button 
        className="w-full" 
        variant="secondary"
        size="sm"
        onClick={() => handleMessage(connection.id)}
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

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            {activeTab === 'teachers' && (
              <>
                <Select value={filterCurriculum} onValueChange={setFilterCurriculum}>
                  <SelectTrigger>
                    <SelectValue placeholder="Curriculum" />
                  </SelectTrigger>
                  <SelectContent>
                    {curriculumOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjectOptions.map(s => (
                      <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            {activeTab === 'connections' && (
              <Select value={filterEducation} onValueChange={setFilterEducation}>
                <SelectTrigger>
                  <SelectValue placeholder="Education Level" />
                </SelectTrigger>
                <SelectContent>
                  {educationOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={filterDistance} onValueChange={setFilterDistance}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
                <SelectItem value="100">100 km</SelectItem>
                <SelectItem value="9999">Any distance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2">
          <TabsList className="w-full max-w-lg mx-auto">
            <TabsTrigger value="teachers" className="flex-1">
              <GraduationCap className="w-4 h-4 mr-2" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex-1">
              <Users className="w-4 h-4 mr-2" />
              Connections
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="teachers" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full pb-20">
            <div className="max-w-lg mx-auto p-4 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-44 skeleton-shimmer rounded-xl" />
                ))
              ) : filteredTeachers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No teachers found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setFilterSubject('all');
                      setFilterCurriculum('all');
                      setFilterDistance('100');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                filteredTeachers.map(renderTeacherCard)
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="connections" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full pb-20">
            <div className="max-w-lg mx-auto p-4 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-40 skeleton-shimmer rounded-xl" />
                ))
              ) : filteredConnections.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No connections found nearby</p>
                  <p className="text-sm mt-1">Expand your search distance</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setFilterEducation('all');
                      setFilterDistance('100');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                filteredConnections.map(renderConnectionCard)
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiscoverScreen;
