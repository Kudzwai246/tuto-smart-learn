
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Calendar, DollarSign, User, LogOut, Star, Settings, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TutoLogo from './TutoLogo';
import TeacherEarningsCalculator from './TeacherEarningsCalculator';
import { ProfileManagement } from './ProfileManagement';
import { TeacherQualificationForm } from './TeacherQualificationForm';

interface TeacherDashboardProps {
  onSignOut: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onSignOut }) => {
  const [profile, setProfile] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch teacher profile
      const { data: teacherData } = await supabase
        .from('teachers')
        .select(`
          *,
          profiles!inner(*)
        `)
        .eq('id', user.id)
        .single();

      // Fetch subscriptions where this teacher is assigned
      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          students!inner(profiles!inner(full_name))
        `)
        .eq('teacher_id', user.id);

      setProfile(teacherData);
      setSubscriptions(subscriptionsData || []);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
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
                <p className="text-sm text-gray-500">Teacher Dashboard</p>
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
              Teacher Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={
                  profile?.status === 'approved' ? 'default' :
                  profile?.status === 'pending' ? 'secondary' : 'outline'
                }>
                  {profile?.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subjects</p>
                <p className="font-semibold">{profile?.subjects?.join(', ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-semibold">{profile?.experience_years} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Curriculum</p>
                <p className="font-semibold capitalize">{profile?.curriculum}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-semibold">{profile?.rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold">{profile?.location_city}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList>
            <TabsTrigger value="students">My Students</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="earnings">Earnings Calculator</TabsTrigger>
            <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Current Students & Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Yet</h3>
                    <p className="text-gray-600">
                      {profile?.status === 'approved' 
                        ? "Students will appear here once they subscribe to your lessons"
                        : "Complete your profile verification to start receiving students"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div key={subscription.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{subscription.subject}</h3>
                            <p className="text-gray-600">
                              Student: {subscription.students.profiles.full_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {subscription.lesson_type} • ${subscription.price_usd}/{subscription.duration}
                            </p>
                            <p className="text-sm text-gray-500">
                              Level: {subscription.education_level?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </p>
                          </div>
                          <Badge variant={
                            subscription.status === 'active' ? 'default' :
                            subscription.status === 'pending' ? 'secondary' : 'outline'
                          }>
                            {subscription.status}
                          </Badge>
                        </div>
                        {subscription.status === 'active' && (
                          <div className="mt-3 flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Lesson
                            </Button>
                            <Button size="sm" variant="outline">
                              Send Progress Report
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Lesson Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Coming Soon</h3>
                  <p className="text-gray-600">
                    Lesson scheduling and calendar integration will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <TeacherEarningsCalculator teacherId={profile?.id} />
          </TabsContent>

          <TabsContent value="qualifications">
            <TeacherQualificationForm teacherId={profile?.id} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileManagement userId={profile?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;
