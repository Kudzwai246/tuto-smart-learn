
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
import { supabase } from '@/integrations/supabase/client';
import { EDUCATION_LEVELS, EducationLevel } from '@/types';

interface StudentRegistrationProps {
  onBack: () => void;
  onRegistrationComplete: () => void;
}

const StudentRegistration: React.FC<StudentRegistrationProps> = ({ onBack, onRegistrationComplete }) => {
  const [formData, setFormData] = useState({
    educationLevel: '',
    lessonType: '',
    locationAddress: '',
    locationCity: '',
    guardianName: '',
    guardianEmail: '',
    guardianPhone: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.educationLevel || !formData.lessonType || !formData.locationAddress || 
        !formData.locationCity || !formData.guardianName || !formData.guardianEmail || !formData.guardianPhone) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to complete registration');
        return;
      }

      const { error } = await supabase
        .from('students')
        .insert({
          id: user.id,
          education_level: formData.educationLevel as EducationLevel,
          preferred_lesson_type: formData.lessonType as 'individual' | 'group',
          location_address: formData.locationAddress,
          location_city: formData.locationCity,
          guardian_name: formData.guardianName,
          guardian_email: formData.guardianEmail,
          guardian_phone: formData.guardianPhone,
        });

      if (error) throw error;
      
      toast.success('Student registration completed successfully!');
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
              Complete Your Profile
            </CardTitle>
            <p className="text-gray-600">
              Tell us more about your learning needs
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Education Level */}
              <div>
                <Label>Education Level & Grade</Label>
                <Select onValueChange={(value) => setFormData(prev => ({...prev, educationLevel: value}))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your current grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
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
                      Individual Lessons (1-on-1) - Higher cost, personalized attention
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="group" id="group" />
                    <Label htmlFor="group" className="text-sm">
                      Group Lessons (Max 5 students) - Lower cost, collaborative learning
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="locationAddress">Home Address</Label>
                  <div className="relative mt-1">
                    <Input
                      id="locationAddress"
                      type="text"
                      placeholder="Enter your full address"
                      value={formData.locationAddress}
                      onChange={(e) => setFormData(prev => ({...prev, locationAddress: e.target.value}))}
                      className="pl-10"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="locationCity">City/Area</Label>
                  <Input
                    id="locationCity"
                    type="text"
                    placeholder="e.g., Harare, Bulawayo, Gweru"
                    value={formData.locationCity}
                    onChange={(e) => setFormData(prev => ({...prev, locationCity: e.target.value}))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Guardian Information */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">Guardian Information</h3>
                <p className="text-sm text-gray-600">
                  Progress reports will be sent to your guardian every two weeks
                </p>
                
                <div>
                  <Label htmlFor="guardianName">Guardian Full Name</Label>
                  <Input
                    id="guardianName"
                    type="text"
                    placeholder="Parent/Guardian full name"
                    value={formData.guardianName}
                    onChange={(e) => setFormData(prev => ({...prev, guardianName: e.target.value}))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="guardianEmail">Guardian Email</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    placeholder="Guardian email for progress reports"
                    value={formData.guardianEmail}
                    onChange={(e) => setFormData(prev => ({...prev, guardianEmail: e.target.value}))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="guardianPhone">Guardian Phone</Label>
                  <Input
                    id="guardianPhone"
                    type="tel"
                    placeholder="Guardian phone number"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData(prev => ({...prev, guardianPhone: e.target.value}))}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-orange-600 text-white py-6 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Completing Registration...' : 'Complete Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500">
          All information is secure and will only be used for educational purposes
        </p>
      </div>
    </div>
  );
};

export default StudentRegistration;
