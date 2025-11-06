import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Star, Search, Filter, MessageCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiscoverTeachersScreenProps {
  userId: string;
  onBack: () => void;
  onMessageTeacher: (teacherId: string) => void;
}

const DiscoverTeachersScreen: React.FC<DiscoverTeachersScreenProps> = ({
  userId,
  onBack,
  onMessageTeacher
}) => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterDistance, setFilterDistance] = useState<string>('all');
  const [studentLocation, setStudentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchStudentLocation();
  }, []);

  useEffect(() => {
    if (studentLocation) {
      fetchNearbyTeachers();
    }
  }, [studentLocation, filterSubject, filterDistance]);

  const fetchStudentLocation = async () => {
    try {
      const { data: studentData } = await supabase
        .from('students')
        .select('residence_lat, residence_lng, subject_selections')
        .eq('id', userId)
        .single();

      if (studentData?.residence_lat && studentData?.residence_lng) {
        setStudentLocation({
          lat: studentData.residence_lat,
          lng: studentData.residence_lng
        });
      }
    } catch (error) {
      console.error('Error fetching student location:', error);
    }
  };

  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const fetchNearbyTeachers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('teachers')
        .select(`
          *,
          profiles!inner(full_name, email, avatar_url)
        `)
        .eq('approved', true);

      const { data: teachersData, error } = await query;

      if (error) throw error;

      // Calculate distances and filter
      let teachersWithDistance = (teachersData || [])
        .filter(t => t.business_lat && t.business_lng)
        .map(t => ({
          ...t,
          distance_km: studentLocation
            ? haversine(studentLocation.lat, studentLocation.lng, t.business_lat, t.business_lng)
            : 0
        }));

      // Apply subject filter
      if (filterSubject !== 'all') {
        teachersWithDistance = teachersWithDistance.filter(t =>
          t.subjects && t.subjects.includes(filterSubject)
        );
      }

      // Apply distance filter
      if (filterDistance !== 'all') {
        const maxDistance = parseFloat(filterDistance);
        teachersWithDistance = teachersWithDistance.filter(t => t.distance_km <= maxDistance);
      }

      // Sort by distance
      teachersWithDistance.sort((a, b) => a.distance_km - b.distance_km);

      setTeachers(teachersWithDistance);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subjects?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen gradient-bg pb-20">
      {/* Header */}
      <header className="glass border-b border-border/50 backdrop-blur-xl sticky top-0 z-40 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Discover Teachers
            </h1>
            <p className="text-sm text-muted-foreground">Find qualified teachers near you</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <Card className="glass border-border/50 backdrop-blur-lg">
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Geography">Geography</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDistance} onValueChange={setFilterDistance}>
                <SelectTrigger>
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Any Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Distance</SelectItem>
                  <SelectItem value="5">Within 5 km</SelectItem>
                  <SelectItem value="10">Within 10 km</SelectItem>
                  <SelectItem value="20">Within 20 km</SelectItem>
                  <SelectItem value="50">Within 50 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Teachers List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="loading-skeleton w-16 h-16 rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Finding teachers near you...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <Card className="glass border-border/50 backdrop-blur-lg">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <MapPin className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No teachers found</h3>
                  <p className="text-muted-foreground max-w-md">
                    {searchTerm || filterSubject !== 'all' || filterDistance !== 'all'
                      ? 'Try adjusting your search criteria or filters.'
                      : 'No teachers are available in your area at the moment. Check back soon!'}
                  </p>
                </div>
                {(searchTerm || filterSubject !== 'all' || filterDistance !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterSubject('all');
                      setFilterDistance('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTeachers.map((teacher) => (
              <Card key={teacher.id} className="glass border-border/50 backdrop-blur-lg hover:shadow-xl hover:shadow-primary/20 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xl font-bold">
                        {teacher.profiles?.full_name?.charAt(0) || 'T'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1">
                        <div className="w-3 h-3 rounded-full bg-white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{teacher.profiles?.full_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{teacher.location_city} • {teacher.distance_km.toFixed(1)} km away</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-primary fill-primary" />
                          <span className="text-sm font-semibold text-primary">{teacher.rating}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Subjects */}
                        <div className="flex flex-wrap gap-2">
                          {teacher.subjects?.slice(0, 5).map((subject: string, idx: number) => (
                            <Badge key={idx} variant="secondary">
                              {subject}
                            </Badge>
                          ))}
                          {teacher.subjects?.length > 5 && (
                            <Badge variant="outline">+{teacher.subjects.length - 5} more</Badge>
                          )}
                        </div>

                        {/* Experience */}
                        <p className="text-sm text-muted-foreground">
                          {teacher.experience_years} years of teaching experience
                        </p>

                        {/* Action Button */}
                        <Button
                          className="w-full gradient-primary"
                          onClick={() => onMessageTeacher(teacher.id)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverTeachersScreen;
