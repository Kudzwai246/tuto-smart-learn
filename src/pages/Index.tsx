
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import WelcomeScreen from '../components/WelcomeScreen';
import UserTypeSelection from '../components/UserTypeSelection';
import StudentRegistration from '../components/StudentRegistration';
import TeacherApplication from '../components/TeacherApplication';
import StudentDashboard from '../components/StudentDashboard';
import TeacherPendingApproval from '../components/TeacherPendingApproval';
import AdminDashboard from '../components/AdminDashboard';
import AuthPage from '../components/AuthPage';

type AppState = 
  | 'welcome' 
  | 'auth'
  | 'userTypeSelection' 
  | 'studentRegistration' 
  | 'teacherApplication'
  | 'studentDashboard'
  | 'teacherPendingApproval'
  | 'adminDashboard';

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser(session.user);
          setUserType(profile.user_type);
          
          // Route to appropriate dashboard
          if (profile.user_type === 'admin') {
            setCurrentState('adminDashboard');
          } else if (profile.user_type === 'student') {
            // Check if student profile is complete
            const { data: studentData } = await supabase
              .from('students')
              .select('id')
              .eq('id', session.user.id)
              .single();
            
            if (studentData) {
              setCurrentState('studentDashboard');
            } else {
              setCurrentState('studentRegistration');
            }
          } else if (profile.user_type === 'teacher') {
            // Check teacher status
            const { data: teacherData } = await supabase
              .from('teachers')
              .select('approved, status')
              .eq('id', session.user.id)
              .single();
            
            if (teacherData) {
              setCurrentState('teacherPendingApproval');
            } else {
              setCurrentState('teacherApplication');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    setCurrentState('auth');
  };

  const handleAuthSuccess = (user: User, userType: string) => {
    setUser(user);
    setUserType(userType);
    
    if (userType === 'admin') {
      setCurrentState('adminDashboard');
    } else if (userType === 'student') {
      setCurrentState('studentRegistration');
    } else if (userType === 'teacher') {
      setCurrentState('teacherApplication');
    }
  };

  const handleBackToWelcome = () => {
    setCurrentState('welcome');
  };

  const handleBackToAuth = () => {
    setCurrentState('auth');
  };

  const handleStudentRegistrationComplete = () => {
    setCurrentState('studentDashboard');
  };

  const handleTeacherApplicationSubmitted = () => {
    setCurrentState('teacherPendingApproval');
  };

  const handleSignOut = () => {
    setUser(null);
    setUserType(null);
    setCurrentState('welcome');
  };

  const renderCurrentScreen = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading Tuto...</p>
          </div>
        </div>
      );
    }

    switch (currentState) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
      
      case 'auth':
        return (
          <AuthPage 
            onAuthSuccess={handleAuthSuccess}
          />
        );
      
      case 'studentRegistration':
        return (
          <StudentRegistration 
            onBack={handleBackToAuth}
            onRegistrationComplete={handleStudentRegistrationComplete}
          />
        );
      
      case 'teacherApplication':
        return (
          <TeacherApplication 
            onBack={handleBackToAuth}
            onApplicationSubmitted={handleTeacherApplicationSubmitted}
          />
        );
      
      case 'studentDashboard':
        return <StudentDashboard onSignOut={handleSignOut} />;
      
      case 'teacherPendingApproval':
        return (
          <TeacherPendingApproval 
            onBackToHome={handleBackToWelcome}
          />
        );
      
      case 'adminDashboard':
        return <AdminDashboard onSignOut={handleSignOut} />;
      
      default:
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="app-container">
      {renderCurrentScreen()}
    </div>
  );
};

export default Index;
