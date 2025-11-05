import React, { useState } from 'react';
import BottomNav, { TabType } from '@/components/navigation/BottomNav';
import FeedScreen from '@/components/feed/FeedScreen';
import MessagesScreen from '@/components/messages/MessagesScreen';
import { TutoLibrary } from '@/components/library/TutoLibrary';
import { ProfileManagement } from '@/components/ProfileManagement';

interface DashboardWithNavProps {
  userId: string;
  userType: 'student' | 'teacher' | 'admin';
  onSignOut: () => void;
  hasActiveSubscription?: boolean;
}

const DashboardWithNav: React.FC<DashboardWithNavProps> = ({
  userId,
  userType,
  onSignOut,
  hasActiveSubscription = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedScreen userId={userId} userType={userType} />;
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
            <ProfileManagement userId={userId} />
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
