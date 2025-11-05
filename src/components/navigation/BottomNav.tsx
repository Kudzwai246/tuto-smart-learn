import React from 'react';
import { Home, BookOpen, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'feed' | 'library' | 'messages' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'feed' as TabType, icon: Home, label: 'Feed' },
    { id: 'library' as TabType, icon: BookOpen, label: 'Library' },
    { id: 'messages' as TabType, icon: MessageCircle, label: 'Messages' },
    { id: 'profile' as TabType, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 mobile-safe-area">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-200 relative flex-1 h-full",
                "touch-manipulation"
              )}
              aria-label={tab.label}
            >
              <div
                className={cn(
                  "flex items-center justify-center px-4 py-2 rounded-full transition-all duration-200",
                  isActive
                    ? "gradient-primary text-primary-foreground scale-110"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  "text-xs mt-1 transition-all duration-200",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
