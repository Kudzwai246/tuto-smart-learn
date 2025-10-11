
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Calendar, CreditCard, User, LogOut, Plus, Star, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TutoLogo from './TutoLogo';
import { PAYMENT_METHODS } from '@/types';
import { ProfileManagement } from './ProfileManagement';
import { TutoLibrary } from './library/TutoLibrary';
import { TeacherRatingForm } from './TeacherRatingForm';
import { TeacherProfileEnhanced } from './TeacherProfileEnhanced';

interface StudentDashboardProps {
  onSignOut: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onSignOut }) => {
  const [profile, setProfile] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSubscription, setShowNewSubscription] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showRatingForm, setShowRatingForm] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch student profile
      const { data: studentData } = await supabase
        .from('students')
        .select(`
          *,
          profiles!inner(*)
        `)
        .eq('id', user.id)
        .single();

      // Fetch subscriptions
      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          teachers!inner(profiles!inner(full_name))
        `)
        .eq('student_id', user.id);

      // Fetch approved teachers
      const { data: teachersData } = await supabase
        .from('teachers')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .eq('approved', true);

      setProfile(studentData);
      setSubscriptions(subscriptionsData || []);
      const list = teachersData || [];
      setTeachers(list);

      // Build suggestions: subjects student wants but has no subscription yet, sorted by distance
      if (studentData?.residence_lat && studentData?.residence_lng && Array.isArray(studentData?.subject_selections)) {
        const activeSubjects = new Set((subscriptionsData || []).map((s: any) => s.subject));
        const neededSubjects = (studentData.subject_selections as string[]).filter((s: string) => !activeSubjects.has(s));
        const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const toRad = (v: number) => (v * Math.PI) / 180;
          const R = 6371; // km
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
          return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
        };
        const nearby: any[] = [];
        for (const t of list) {
          if (!t.business_lat || !t.business_lng || !Array.isArray(t.subjects)) continue;
          const dist = haversine(studentData.residence_lat, studentData.residence_lng, t.business_lat, t.business_lng);
          const overlap = (t.subjects as string[]).filter((s) => neededSubjects.includes(s));
          if (overlap.length > 0) {
            nearby.push({ ...t, distance_km: dist, matched_subjects: overlap });
          }
        }
        nearby.sort((a, b) => a.distance_km - b.distance_km);
        setSuggestions(nearby.slice(0, 10));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const handlePayment = (subscriptionId: string, amount: number) => {
    toast.info('Payment integration will be implemented soon. You selected: USD $' + amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <TutoLogo size="lg" className="justify-center mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <TutoLogo size="sm" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome, {profile?.profiles?.full_name}
                </h1>
                <p className="text-sm text-gray-500">Student Dashboard</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Education Level</p>
                <p className="font-semibold">
                  {profile?.education_level?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred Lesson Type</p>
                <p className="font-semibold capitalize">{profile?.preferred_lesson_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold">{profile?.location_city}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="subscriptions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="library">Tuto Library</TabsTrigger>
            <TabsTrigger value="subscriptions">My Subscriptions</TabsTrigger>
            <TabsTrigger value="teachers">Find Teachers</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <TutoLibrary 
              userType="student" 
              userId={profile?.id || ''} 
              hasActiveSubscription={subscriptions.filter(s => s.status === 'active').length > 0}
            />
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Subscriptions</CardTitle>
                <Button onClick={() => setShowNewSubscription(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Subscription
                </Button>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subscriptions Yet</h3>
                    <p className="text-gray-600 mb-4">Start your learning journey by subscribing to a teacher</p>
                    <Button onClick={() => setShowNewSubscription(true)}>Find Teachers</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div key={subscription.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{subscription.subject}</h3>
                            <p className="text-gray-600">
                              Teacher: {subscription.teachers.profiles.full_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {subscription.lesson_type} • ${subscription.price_usd}/{subscription.duration}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant={
                              subscription.status === 'active' ? 'default' :
                              subscription.status === 'pending' ? 'secondary' : 'outline'
                            }>
                              {subscription.status}
                            </Badge>
                            {subscription.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowRatingForm(subscription.teacher_id)}
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Rate Teacher
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <CardTitle>Teachers Near You (Matching Your Subjects)</CardTitle>
              </CardHeader>
              <CardContent>
                {suggestions.length === 0 ? (
                  <p className="text-sm text-gray-600">No nearby matches yet. Make sure you added subjects during registration and enabled location.</p>
                ) : (
                  <div className="space-y-4">
                    {suggestions.map((t) => (
                      <div key={t.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{t.profiles.full_name}</h3>
                            <p className="text-gray-600">Subjects match: {t.matched_subjects.join(', ')}</p>
                            <p className="text-sm text-gray-500">Experience: {t.experience_years} years • {t.curriculum}</p>
                            <p className="text-sm text-gray-500">Distance: {t.distance_km.toFixed(1)} km • Location: {t.location_city}</p>
                            <div className="flex items-center mt-2">
                              <span className="text-yellow-500">★</span>
                              <span className="ml-1 text-sm">{(t.rating ?? 4.5).toFixed ? (t.rating ?? 4.5).toFixed(1) : Number(t.rating ?? 4.5).toFixed(1)}</span>
                            </div>
                            <div className="mt-2">
                              <a className="text-sm underline" href={`https://www.google.com/maps/search/?api=1&query=${t.business_lat},${t.business_lng}`} target="_blank" rel="noreferrer">
                                View on Google Maps
                              </a>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button 
                              size="sm"
                              onClick={() => setSelectedTeacher(t.id)}
                            >
                              View Profile
                            </Button>
                            <Button size="sm" variant="outline">Contact Teacher</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="h-6" />

            <Card>
              <CardHeader>
                <CardTitle>All Available Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{teacher.profiles.full_name}</h3>
                          <p className="text-gray-600">Subjects: {teacher.subjects.join(', ')}</p>
                          <p className="text-sm text-gray-500">
                            Experience: {teacher.experience_years} years • {teacher.curriculum}
                          </p>
                          <p className="text-sm text-gray-500">Location: {teacher.location_city}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-yellow-500">★</span>
                            <span className="ml-1 text-sm">{(teacher.rating ?? 4.5).toFixed ? (teacher.rating ?? 4.5).toFixed(1) : Number(teacher.rating ?? 4.5).toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            size="sm"
                            onClick={() => setSelectedTeacher(teacher.id)}
                          >
                            View Profile
                          </Button>
                          <Button size="sm" variant="outline">Contact Teacher</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Payment Information</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      All payments are processed in USD. Available payment methods:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {PAYMENT_METHODS.map((method) => (
                        <div key={method.value} className="flex items-center p-3 bg-white rounded border">
                          <div className="flex-1">
                            <p className="font-medium">{method.label}</p>
                            <p className="text-sm text-gray-500">USD payments only</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handlePayment('demo', 25)}
                          >
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-800 mb-2">Payment Integration</h3>
                    <p className="text-sm text-orange-700">
                      Payment processing APIs will be integrated soon. For now, you can view available payment methods.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <ProfileManagement userId={profile?.id} />
          </TabsContent>
        </Tabs>

        {/* Rating Form Modal */}
        {showRatingForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <TeacherRatingForm
              teacherId={showRatingForm}
              studentId={profile?.id}
              onRatingSubmitted={() => {
                setShowRatingForm(null);
                fetchStudentData();
              }}
              onCancel={() => setShowRatingForm(null)}
            />
          </div>
        )}

        {/* Teacher Profile Modal */}
        {selectedTeacher && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Teacher Profile</h2>
                  <Button variant="ghost" onClick={() => setSelectedTeacher(null)}>
                    ×
                  </Button>
                </div>
                <TeacherProfileEnhanced
                  teacherId={selectedTeacher}
                  showContactButton={true}
                  onContact={() => toast.info('Contact feature coming soon!')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
