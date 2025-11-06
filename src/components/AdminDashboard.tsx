
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
      // Get current user and verify admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if user has admin role
        const { data: isAdmin } = await supabase.rpc('is_admin', { _uid: user.id });
        
        if (!isAdmin) {
          toast.error('Unauthorized: Admin access required');
          onSignOut();
          return;
        }

        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
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
      // Get teacher data before updating
      const { data: teacherData, error: fetchError } = await supabase
        .from('teachers')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .eq('id', teacherId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('teachers')
        .update({ 
          status: newStatus,
          approved: newStatus === 'approved'
        })
        .eq('id', teacherId);

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke('send-notifications', {
          body: {
            notificationData: {
              recipientEmail: teacherData.profiles.email,
              recipientName: teacherData.profiles.full_name,
              notificationType: newStatus === 'approved' ? 'account_approved' : 'account_rejected',
              title: newStatus === 'approved' 
                ? 'Welcome Aboard! Your Tuto Teacher Account is Approved 🎉'
                : 'Teacher Application Status Update',
              message: newStatus === 'approved'
                ? 'Congratulations! Your application has been approved!'
                : 'Thank you for your interest in becoming a Tuto teacher.',
              additionalData: {
                fullName: teacherData.profiles.full_name,
                subjects: teacherData.subjects,
                city: teacherData.location_city,
                experience: teacherData.experience_years,
                rejectionReason: newStatus === 'rejected' 
                  ? 'Please contact support@tuto.co.zw for more information about your application.'
                  : undefined
              }
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't block the status update if email fails
      }

      toast.success(`Teacher ${newStatus} successfully${newStatus === 'approved' ? ' - Welcome email sent!' : ''}`);
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
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full animate-pulse" />
            <TutoLogo size="lg" className="relative justify-center" />
          </div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Modern Header with Glass Effect */}
      <div className="glass border-b border-border/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <TutoLogo size="sm" />
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentAdmin?.email === 'luckilyimat@gmail.com' 
                    ? 'Kudzwai Madyavanhu - CEO & Co-Founder'
                    : currentAdmin?.email === 'chiwandiretakunda75@gmail.com'
                    ? 'Takunda Chiwandire - COO & Co-Founder'
                    : 'Administrator'
                  }
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="border-primary/50 hover:bg-primary/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Stats Cards with Blue Accents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="glass border-border/50 backdrop-blur-lg shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50 backdrop-blur-lg shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <div className="p-2 rounded-full bg-primary/10">
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalTeachers}</div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50 backdrop-blur-lg shadow-lg hover:shadow-xl hover:shadow-warning/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <div className="p-2 rounded-full bg-warning/10">
                <Eye className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pendingTeachers}</div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50 backdrop-blur-lg shadow-lg hover:shadow-xl hover:shadow-success/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <div className="p-2 rounded-full bg-success/10">
                <BookOpen className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.activeSubscriptions}</div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50 backdrop-blur-lg shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <div className="p-2 rounded-full bg-primary/10">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Main Content with Glass Effect */}
        <Tabs defaultValue="teachers" className="space-y-6">
          <TabsList className="glass border-border/50 backdrop-blur-lg p-1">
            <TabsTrigger value="teachers" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">
              Teachers
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">
              Students
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teachers" className="animate-fade-in">
            <Card className="glass border-border/50 backdrop-blur-lg shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Teacher Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:border-primary/50 transition-colors bg-card/50">
                      <div className="flex-1">
                        <h3 className="font-semibold">{teacher.profiles.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{teacher.profiles.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {teacher.subjects.join(', ')} • {teacher.experience_years} years experience
                        </p>
                        <p className="text-sm text-muted-foreground">{teacher.location_city}</p>
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
                              className="gradient-primary"
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

          <TabsContent value="students" className="animate-fade-in">
            <Card className="glass border-border/50 backdrop-blur-lg shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Student Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:border-primary/50 transition-colors bg-card/50">
                      <div className="flex-1">
                        <h3 className="font-semibold">{student.profiles.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{student.profiles.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.education_level.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} • {student.preferred_lesson_type}
                        </p>
                        <p className="text-sm text-muted-foreground">Guardian: {student.guardian_name} ({student.guardian_email})</p>
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

          <TabsContent value="subscriptions" className="animate-fade-in">
            <Card className="glass border-border/50 backdrop-blur-lg shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Subscription Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:border-primary/50 transition-colors bg-card/50">
                      <div className="flex-1">
                        <h3 className="font-semibold">{subscription.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          Student: {subscription.students.profiles.full_name} • 
                          Teacher: {subscription.teachers.profiles.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
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

          <TabsContent value="profile" className="animate-fade-in">
            {currentAdmin && <ProfileManagement userId={currentAdmin.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
