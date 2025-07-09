
import React, { useState } from 'react';
import WelcomeScreen from '../components/WelcomeScreen';
import UserTypeSelection from '../components/UserTypeSelection';
import StudentRegistration from '../components/StudentRegistration';
import TeacherApplication from '../components/TeacherApplication';
import StudentDashboard from '../components/StudentDashboard';
import TeacherPendingApproval from '../components/TeacherPendingApproval';

type AppState = 
  | 'welcome' 
  | 'userTypeSelection' 
  | 'studentRegistration' 
  | 'teacherApplication'
  | 'studentDashboard'
  | 'teacherPendingApproval';

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('welcome');

  const handleGetStarted = () => {
    setCurrentState('userTypeSelection');
  };

  const handleBackToWelcome = () => {
    setCurrentState('welcome');
  };

  const handleBackToUserSelection = () => {
    setCurrentState('userTypeSelection');
  };

  const handleUserTypeSelection = (type: 'student' | 'teacher') => {
    if (type === 'student') {
      setCurrentState('studentRegistration');
    } else {
      setCurrentState('teacherApplication');
    }
  };

  const handleStudentRegistrationComplete = () => {
    setCurrentState('studentDashboard');
  };

  const handleTeacherApplicationSubmitted = () => {
    setCurrentState('teacherPendingApproval');
  };

  const handleBackToHome = () => {
    setCurrentState('welcome');
  };

  const renderCurrentScreen = () => {
    switch (currentState) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
      
      case 'userTypeSelection':
        return (
          <UserTypeSelection 
            onSelectType={handleUserTypeSelection}
            onBack={handleBackToWelcome}
          />
        );
      
      case 'studentRegistration':
        return (
          <StudentRegistration 
            onBack={handleBackToUserSelection}
            onRegistrationComplete={handleStudentRegistrationComplete}
          />
        );
      
      case 'teacherApplication':
        return (
          <TeacherApplication 
            onBack={handleBackToUserSelection}
            onApplicationSubmitted={handleTeacherApplicationSubmitted}
          />
        );
      
      case 'studentDashboard':
        return <StudentDashboard />;
      
      case 'teacherPendingApproval':
        return (
          <TeacherPendingApproval 
            onBackToHome={handleBackToHome}
          />
        );
      
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
