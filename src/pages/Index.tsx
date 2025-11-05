
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import components
import WelcomeScreen from '@/components/WelcomeScreen';
import UserTypeSelection from '@/components/UserTypeSelection';
import AuthPage from '@/components/AuthPage';
import StudentRegistration from '@/components/StudentRegistration';
import TeacherApplication from '@/components/TeacherApplication';
import TeacherPendingApproval from '@/components/TeacherPendingApproval';
import DashboardWithNav from '@/components/DashboardWithNav';
import AdminDashboard from '@/components/AdminDashboard';

type AppState = 
  | 'welcome' 
  | 'user-type-selection' 
  | 'auth' 
  | 'student-registration' 
  | 'teacher-application'
  | 'teacher-pending'
  | 'student-dashboard' 
  | 'teacher-dashboard'
  | 'admin-dashboard';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string>('');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch to avoid race conditions
          setTimeout(async () => {
            if (!mounted) return;
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('user_type')
              .eq('id', session.user.id)
              .single();
            
            if (profile && mounted) {
              handleUserAuthenticated(session.user, profile.user_type);
            }
          }, 0);
        } else {
          setAppState('welcome');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          if (!mounted) return;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();
          
          if (profile && mounted) {
            handleUserAuthenticated(session.user, profile.user_type);
          }
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUserAuthenticated = async (authenticatedUser: User, type: string) => {
    setUser(authenticatedUser);
    setUserType(type);

    if (type === 'admin') {
      setAppState('admin-dashboard');
      return;
    }

    if (type === 'student') {
      // Check if student profile is complete
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', authenticatedUser.id)
        .single();
      
      if (studentData) {
        setAppState('student-dashboard');
      } else {
        setAppState('student-registration');
      }
    } else if (type === 'teacher') {
      // Check teacher status
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', authenticatedUser.id)
        .single();
      
      if (teacherData) {
        if (teacherData.status === 'approved') {
          setAppState('teacher-dashboard');
        } else {
          setAppState('teacher-pending');
        }
      } else {
        setAppState('teacher-application');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserType('');
      setSession(null);
      setAppState('welcome');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  // Render based on current state
  switch (appState) {
    case 'welcome':
      return <WelcomeScreen onGetStarted={() => setAppState('user-type-selection')} />;
    
    case 'user-type-selection':
      return (
        <UserTypeSelection 
          onBack={() => setAppState('welcome')}
          onSelectType={() => setAppState('auth')}
        />
      );
    
    case 'auth':
      return (
        <AuthPage 
          onAuthSuccess={handleUserAuthenticated}
        />
      );
    
    case 'student-registration':
      return (
        <StudentRegistration 
          onBack={() => setAppState('auth')}
          onRegistrationComplete={() => setAppState('student-dashboard')}
        />
      );
    
    case 'teacher-application':
      return (
        <TeacherApplication 
          onBack={() => setAppState('auth')}
          onApplicationSubmitted={() => setAppState('teacher-pending')}
        />
      );
    
    case 'teacher-pending':
      return (
        <TeacherPendingApproval 
          onBackToHome={handleSignOut}
        />
      );
    
    case 'student-dashboard':
      return (
        <DashboardWithNav
          userId={user?.id || ''}
          userType="student"
          onSignOut={handleSignOut}
          hasActiveSubscription={true}
        />
      );
    
    case 'teacher-dashboard':
      return (
        <DashboardWithNav
          userId={user?.id || ''}
          userType="teacher"
          onSignOut={handleSignOut}
        />
      );
    
    case 'admin-dashboard':
      return <AdminDashboard onSignOut={handleSignOut} />;
    
    default:
      return <WelcomeScreen onGetStarted={() => setAppState('user-type-selection')} />;
  }
};

export default Index;
