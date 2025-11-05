
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Users, BookOpen, Star, Clock, DollarSign } from 'lucide-react';
import TutoLogo from './TutoLogo';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: "Local Teachers",
      description: "Find trusted teachers near you"
    },
    {
      icon: <DollarSign className="w-6 h-6 text-primary" />,
      title: "Affordable Rates",
      description: "Less than half the price of traditional tutoring"
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Group & Individual",
      description: "Choose between one-on-one or group sessions"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-primary" />,
      title: "All Subjects",
      description: "Primary, O-level, and A-level curriculum"
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "Flexible Schedule",
      description: "1.5 hour sessions, 6 days a week"
    },
    {
      icon: <Star className="w-6 h-6 text-primary" />,
      title: "Quality Assured",
      description: "All teachers are verified and qualified"
    }
  ];

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <TutoLogo size="lg" className="justify-center" />
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome to Tuto
            </h1>
            <p className="text-muted-foreground text-lg">
              Quality education at affordable prices
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-border shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 text-center space-y-2">
                <div className="flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-sm">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Highlight */}
        <Card className="gradient-primary text-primary-foreground border-none shadow-lg">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">
              Starting from $7/month
            </h3>
            <p className="opacity-90">
              Group lessons for O-level subjects
            </p>
          </CardContent>
        </Card>

        {/* Get Started Button */}
        <Button 
          onClick={onGetStarted}
          className="w-full gradient-primary py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          Get Started
        </Button>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Revolutionizing education in Zimbabwe
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
