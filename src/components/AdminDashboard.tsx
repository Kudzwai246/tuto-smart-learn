
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, GraduationCap, BookOpen, DollarSign, Eye, LogOut, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TutoLogo from './TutoLogo';
import { ProfileManagement } from './ProfileManagement';

interface AdminDashboardProps {
  onSignOut: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSignOut }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    pendingTeachers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
  });
  
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentAdmin(adminProfile);
      }

      // Fetch students with their profiles
      const { data: studentsData } = await supabase
        .from('students')
        .select(`
          *,
          profiles!inner(*)
        `);

      // Fetch teachers with their profiles  
      const { data: teachersData } = await supabase
        .from('teachers')
        .select(`
          *,
          profiles!inner(*)
        `);

      // Fetch subscriptions with related data
      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          students!inner(profiles!inner(full_name)),
          teachers!inner(profiles!inner(full_name))
        `);

      setStudents(studentsData || []);
      setTeachers(teachersData || []);
      setSubscriptions(subscriptionsData || []);

      // Calculate stats
      const pendingTeachers = teachersData?.filter(t => t.status === 'pending').length || 0;
      const activeSubscriptions = subscriptionsData?.filter(s => s.status === 'active').length || 0;
      const totalRevenue = subscriptionsData?.reduce((sum, s) => sum + (s.price_usd || 0), 0) || 0;

      setStats({
        totalStudents: studentsData?.length || 0,
        totalTeachers: teachersData?.length || 0,
        pendingTeachers,
        activeSubscriptions,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherStatusUpdate = async (teacherId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ 
          status: newStatus,
          approved: newStatus === 'approved'
        })
        .eq('id', teacherId);

      if (error) throw error;

      toast.success(`Teacher ${newStatus} successfully`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating teacher status:', error);
      toast.error('Failed to update teacher status');
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
          <p>Loading admin dashboard...</p>
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
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">
                  {currentAdmin?.email === 'luckilyimat@gmail.com' 
                    ? 'Kudzwai Madyavanhu - CEO & Co-Founder'
                    : currentAdmin?.email === 'chiwandiretakunda75@gmail.com'
                    ? 'Takunda Chiwandire - COO & Co-Founder'
                    : 'Administrator'
                  }
                </p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingTeachers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="teachers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{teacher.profiles.full_name}</h3>
                        <p className="text-sm text-gray-600">{teacher.profiles.email}</p>
                        <p className="text-sm text-gray-500">
                          {teacher.subjects.join(', ')} • {teacher.experience_years} years experience
                        </p>
                        <p className="text-sm text-gray-500">{teacher.location_city}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          teacher.status === 'approved' ? 'default' :
                          teacher.status === 'pending' ? 'secondary' :
                          teacher.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {teacher.status}
                        </Badge>
                        {teacher.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button 
                              size="sm"
                              onClick={() => handleTeacherStatusUpdate(teacher.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleTeacherStatusUpdate(teacher.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Student Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{student.profiles.full_name}</h3>
                        <p className="text-sm text-gray-600">{student.profiles.email}</p>
                        <p className="text-sm text-gray-500">
                          {student.education_level.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} • {student.preferred_lesson_type}
                        </p>
                        <p className="text-sm text-gray-500">Guardian: {student.guardian_name} ({student.guardian_email})</p>
                      </div>
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{subscription.subject}</h3>
                        <p className="text-sm text-gray-600">
                          Student: {subscription.students.profiles.full_name} • 
                          Teacher: {subscription.teachers.profiles.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {subscription.education_level.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} • 
                          {subscription.lesson_type} • ${subscription.price_usd}/{subscription.duration}
                        </p>
                      </div>
                      <Badge variant={
                        subscription.status === 'active' ? 'default' :
                        subscription.status === 'pending' ? 'secondary' : 'outline'
                      }>
                        {subscription.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            {currentAdmin && <ProfileManagement userId={currentAdmin.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
