import React, { useState, useCallback } from 'react';
import BottomNav, { TabType } from '@/components/navigation/BottomNav';
import FeedScreen from '@/components/feed/FeedScreen';
import MessagesScreen from '@/components/messages/MessagesScreen';
import { TutoLibrary } from '@/components/library/TutoLibrary';
import { ProfileManagement } from '@/components/ProfileManagement';
import SettingsScreen from '@/components/SettingsScreen';
import DiscoverScreen from '@/components/discover/DiscoverScreen';
import StudentProfileView from '@/components/StudentProfileView';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import TutoLogo from '@/components/TutoLogo';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardWithNavProps {
  userId: string;
  userType: 'student' | 'teacher' | 'admin';
  onSignOut: () => void;
  hasActiveSubscription?: boolean;
}

type ViewType = 'main' | 'settings' | 'student-profile';

const DashboardWithNav: React.FC<DashboardWithNavProps> = ({
  userId,
  userType,
  onSignOut,
  hasActiveSubscription = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(null);

  const handleShowSettings = () => setCurrentView('settings');
  const handleShowStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView('student-profile');
  };
  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedStudentId(null);
  };

  const handleMessageUser = useCallback(async (targetUserId: string) => {
    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_one.eq.${userId},participant_two.eq.${targetUserId}),and(participant_one.eq.${targetUserId},participant_two.eq.${userId})`)
        .maybeSingle();

      let conversationId: string;

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            participant_one: userId,
            participant_two: targetUserId,
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        conversationId = newConv.id;
        toast.success('Conversation created!');
      }

      // Navigate to messages with the conversation
      setPendingConversationId(conversationId);
      setActiveTab('messages');
      handleBackToMain();
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    }
  }, [userId]);

  // Special views (no bottom nav)
  if (currentView === 'settings') {
    return <SettingsScreen onBack={handleBackToMain} onSignOut={onSignOut} />;
  }

  if (currentView === 'student-profile' && selectedStudentId) {
    return (
      <StudentProfileView
        studentId={selectedStudentId}
        currentUserId={userId}
        onBack={handleBackToMain}
        onMessage={() => handleMessageUser(selectedStudentId)}
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
            onShowStudentProfile={handleShowStudentProfile}
          />
        );
      case 'discover':
        return (
          <DiscoverScreen
            userId={userId}
            userType={userType === 'admin' ? 'student' : userType}
            onMessageUser={handleMessageUser}
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
        const convId = pendingConversationId;
        // Clear pending after passing it
        if (pendingConversationId) {
          setTimeout(() => setPendingConversationId(null), 100);
        }
        return (
          <MessagesScreen 
            userId={userId} 
            initialConversationId={convId}
          />
        );
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
      <header className="glass backdrop-blur-xl border-b border-primary/20 sticky top-0 z-10">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <TutoLogo size="sm" />
            <h1 className="text-xl font-bold gradient-text">TutoSmart</h1>
          </div>
          <NotificationBell />
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default DashboardWithNav;
