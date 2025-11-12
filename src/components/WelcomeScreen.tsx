import React from 'react';
import { Button } from '@/components/ui/button';
import TutoLogo from './TutoLogo';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="h-screen w-screen relative overflow-hidden flex flex-col m-0 p-0">
      {/* Full-screen Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
      
      {/* Main Content - Centered */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pb-32">
        <div className="text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center animate-fade-in">
            <TutoLogo size="lg" className="justify-center" />
          </div>
          
          {/* Tagline */}
          <div className="space-y-2 animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground tracking-tight">
              Tuto
            </h1>
            <p className="text-lg text-primary-foreground/80 font-light">
              Everything is an understatement
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="relative px-6 pb-12 space-y-4 animate-fade-in [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
        <Button 
          onClick={onGetStarted}
          variant="secondary"
          className="w-full h-12 text-base font-semibold rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          Get Started
        </Button>
        
        <p className="text-center text-sm text-primary-foreground/60">
          Join thousands of learners in Zimbabwe
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
