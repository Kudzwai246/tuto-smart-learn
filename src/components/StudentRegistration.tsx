
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, MapPin } from 'lucide-react';
import TutoLogo from './TutoLogo';
import { toast } from 'sonner';

interface StudentRegistrationProps {
  onBack: () => void;
  onRegistrationComplete: () => void;
}

const StudentRegistration: React.FC<StudentRegistrationProps> = ({ onBack, onRegistrationComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    educationLevel: '',
    lessonType: '',
    location: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.educationLevel || !formData.lessonType || !formData.location) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Student registration data:', formData);
      toast.success('Registration successful! Welcome to Tuto!');
      onRegistrationComplete();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <TutoLogo size="sm" />
          <div></div>
        </div>

        <Card className="shadow-lg border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Student Registration
            </CardTitle>
            <p className="text-gray-600">
              Join thousands of students learning with Tuto
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Education Level */}
              <div>
                <Label>Education Level</Label>
                <Select onValueChange={(value) => setFormData(prev => ({...prev, educationLevel: value}))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary School</SelectItem>
                    <SelectItem value="olevel">O-Level (Form 1-4)</SelectItem>
                    <SelectItem value="alevel">A-Level (Form 5-6)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lesson Type Preference */}
              <div>
                <Label>Preferred Lesson Type</Label>
                <RadioGroup 
                  className="mt-2"
                  onValueChange={(value) => setFormData(prev => ({...prev, lessonType: value}))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="text-sm">
                      Individual Lessons (1-on-1)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="group" id="group" />
                    <Label htmlFor="group" className="text-sm">
                      Group Lessons (Max 5 students)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative mt-1">
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter your city/area"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                    className="pl-10"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  We'll help you find teachers near your location
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-orange-600 text-white py-6 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default StudentRegistration;
