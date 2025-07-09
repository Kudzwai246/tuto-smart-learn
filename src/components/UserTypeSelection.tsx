
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, ArrowLeft } from 'lucide-react';
import TutoLogo from './TutoLogo';

interface UserTypeSelectionProps {
  onSelectType: (type: 'student' | 'teacher') => void;
  onBack: () => void;
}

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelectType, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="absolute top-4 left-4 p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <TutoLogo size="lg" className="justify-center" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Join Tuto Today
            </h1>
            <p className="text-gray-600">
              Are you a student or teacher?
            </p>
          </div>
        </div>

        {/* Selection Cards */}
        <div className="space-y-4">
          <Card 
            className="border-2 border-transparent hover:border-primary cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => onSelectType('student')}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">I'm a Student</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <p className="text-gray-600">
                Find qualified teachers near you for affordable tutoring
              </p>
              <div className="space-y-1 text-sm text-gray-500">
                <p>• Access to verified teachers</p>
                <p>• Individual or group sessions</p>
                <p>• All subjects available</p>
                <p>• Starting from $7/month</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-2 border-transparent hover:border-primary cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => onSelectType('teacher')}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">I'm a Teacher</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <p className="text-gray-600">
                Share your knowledge and earn by teaching students
              </p>
              <div className="space-y-1 text-sm text-gray-500">
                <p>• Earn 90% of subscription fees</p>
                <p>• Flexible teaching schedule</p>
                <p>• Online and offline options</p>
                <p>• Build your reputation</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          Quality education for everyone
        </p>
      </div>
    </div>
  );
};

export default UserTypeSelection;
