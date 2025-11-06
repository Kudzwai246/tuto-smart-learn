import React, { useState } from 'react';
import BottomNav, { TabType } from '@/components/navigation/BottomNav';
import FeedScreen from '@/components/feed/FeedScreen';
import MessagesScreen from '@/components/messages/MessagesScreen';
import { TutoLibrary } from '@/components/library/TutoLibrary';
import { ProfileManagement } from '@/components/ProfileManagement';
import SettingsScreen from '@/components/SettingsScreen';
import DiscoverTeachersScreen from '@/components/DiscoverTeachersScreen';
import StudentProfileView from '@/components/StudentProfileView';

interface DashboardWithNavProps {
  userId: string;
  userType: 'student' | 'teacher' | 'admin';
  onSignOut: () => void;
  hasActiveSubscription?: boolean;
}

type ViewType = 'main' | 'settings' | 'discover-teachers' | 'student-profile';

const DashboardWithNav: React.FC<DashboardWithNavProps> = ({
  userId,
  userType,
  onSignOut,
  hasActiveSubscription = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const handleShowSettings = () => setCurrentView('settings');
  const handleShowDiscoverTeachers = () => setCurrentView('discover-teachers');
  const handleShowStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView('student-profile');
  };
  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedStudentId(null);
  };

  const handleMessageTeacher = (teacherId: string) => {
    // Navigate to messages and create conversation
    setActiveTab('messages');
    handleBackToMain();
    // TODO: Open conversation with teacher
  };

  const handleMessageStudent = (studentId: string) => {
    // Navigate to messages and create conversation
    setActiveTab('messages');
    handleBackToMain();
    // TODO: Open conversation with student
  };

  // Special views (no bottom nav)
  if (currentView === 'settings') {
    return <SettingsScreen onBack={handleBackToMain} onSignOut={onSignOut} />;
  }

  if (currentView === 'discover-teachers') {
    return (
      <DiscoverTeachersScreen
        userId={userId}
        onBack={handleBackToMain}
        onMessageTeacher={handleMessageTeacher}
      />
    );
  }

  if (currentView === 'student-profile' && selectedStudentId) {
    return (
      <StudentProfileView
        studentId={selectedStudentId}
        currentUserId={userId}
        onBack={handleBackToMain}
        onMessage={handleMessageStudent}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <FeedScreen
            userId={userId}
            userType={userType}
            onShowDiscoverTeachers={userType === 'student' ? handleShowDiscoverTeachers : undefined}
            onShowStudentProfile={handleShowStudentProfile}
          />
        );
      case 'library':
        return (
          <TutoLibrary
            userType={userType}
            userId={userId}
            hasActiveSubscription={hasActiveSubscription}
          />
        );
      case 'messages':
        return <MessagesScreen userId={userId} />;
      case 'profile':
        return (
          <div className="pb-20">
            <ProfileManagement
              userId={userId}
              onShowSettings={handleShowSettings}
            />
          </div>
        );
      default:
        return <FeedScreen userId={userId} userType={userType} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default DashboardWithNav;
