import React from 'react';
import { ArrowLeft, Bell, Lock, HelpCircle, LogOut, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface SettingsScreenProps {
  onBack: () => void;
  onSignOut: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onSignOut }) => {
  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        {
          icon: <Bell className="w-5 h-5" />,
          label: 'Push Notifications',
          type: 'toggle',
          value: true,
        },
        {
          icon: <Moon className="w-5 h-5" />,
          label: 'Dark Mode',
          type: 'toggle',
          value: true,
        },
        {
          icon: <Globe className="w-5 h-5" />,
          label: 'Language',
          type: 'button',
          value: 'English',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: <Lock className="w-5 h-5" />,
          label: 'Privacy & Security',
          type: 'button',
        },
        {
          icon: <HelpCircle className="w-5 h-5" />,
          label: 'Help & Support',
          type: 'button',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <Card key={groupIndex} className="overflow-hidden">
            <div className="p-4">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                {group.title}
              </h2>
              <div className="space-y-1">
                {group.items.map((item, itemIndex) => (
                  <React.Fragment key={itemIndex}>
                    {itemIndex > 0 && <Separator />}
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground">{item.icon}</div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {item.type === 'toggle' && (
                        <Switch checked={item.value as boolean} />
                      )}
                      {item.type === 'button' && (
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          {item.value || '→'}
                        </Button>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Card>
        ))}

        {/* Sign Out Button */}
        <Button
          onClick={onSignOut}
          variant="destructive"
          className="w-full flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>

        {/* Developer Credit */}
        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            Developed with ❤️ by Tuto Team
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
