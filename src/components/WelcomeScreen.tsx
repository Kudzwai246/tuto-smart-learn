
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
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary-dark/20 animate-shimmer" style={{ backgroundSize: '200% 200%' }} />
      
      <div className="relative w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full animate-pulse" />
            <TutoLogo size="lg" className="relative justify-center" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
              Welcome to Tuto
            </h1>
            <p className="text-muted-foreground text-lg">
              Quality education at affordable prices
            </p>
          </div>
        </div>

        {/* Features Grid with Glass Effect */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="glass border-border/50 backdrop-blur-lg shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group"
            >
              <CardContent className="p-4 text-center space-y-2">
                <div className="flex justify-center">
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
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

        {/* Pricing Highlight with Gradient */}
        <Card className="gradient-primary text-primary-foreground border-none shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold mb-2 animate-fade-in">
              Starting from $7/month
            </h3>
            <p className="opacity-90">
              Group lessons for O-level subjects
            </p>
          </CardContent>
        </Card>

        {/* Get Started Button with Enhanced Gradient */}
        <Button 
          onClick={onGetStarted}
          className="w-full gradient-primary py-6 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Get Started
        </Button>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground animate-fade-in">
          Revolutionizing education in Zimbabwe
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
