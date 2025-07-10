
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Calendar, CreditCard, User, LogOut, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TutoLogo from './TutoLogo';
import { PAYMENT_METHODS } from '@/types';

interface StudentDashboardProps {
  onSignOut: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onSignOut }) => {
  const [profile, setProfile] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSubscription, setShowNewSubscription] = useState(false);

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
      setTeachers(teachersData || []);
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
            <TabsTrigger value="subscriptions">My Subscriptions</TabsTrigger>
            <TabsTrigger value="teachers">Find Teachers</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

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
                          <Badge variant={
                            subscription.status === 'active' ? 'default' :
                            subscription.status === 'pending' ? 'secondary' : 'outline'
                          }>
                            {subscription.status}
                          </Badge>
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
                <CardTitle>Available Teachers</CardTitle>
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
                            <span className="ml-1 text-sm">{teacher.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <Button size="sm">Contact Teacher</Button>
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
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
