
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, MapPin, Plus, X } from 'lucide-react';
import TutoLogo from './TutoLogo';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TeacherApplicationProps {
  onBack: () => void;
  onApplicationSubmitted: () => void;
}

const TeacherApplication: React.FC<TeacherApplicationProps> = ({ onBack, onApplicationSubmitted }) => {
  const [formData, setFormData] = useState({
    qualifications: [''],
    subjects: [''],
    curriculum: '',
    experienceYears: '',
    locationAddress: '',
    locationCity: '',
    lessonLocation: '',
    businessLat: null as number | null,
    businessLng: null as number | null,
    additionalInfo: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const useMyBusinessLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({ ...prev, businessLat: latitude, businessLng: longitude }));
        toast.success('Business location captured!');
      },
      () => toast.error('Failed to get location. Please allow location access.'),
      { enableHighAccuracy: true }
    );
  };

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, '']
    }));
  };

  const removeQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const updateQualification = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.map((qual, i) => i === index ? value : qual)
    }));
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, '']
    }));
  };

  const removeSubject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  const updateSubject = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map((subj, i) => i === index ? value : subj)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validQualifications = formData.qualifications.filter(q => q.trim() !== '');
    const validSubjects = formData.subjects.filter(s => s.trim() !== '');
    
    if (validQualifications.length === 0 || validSubjects.length === 0 || 
        !formData.curriculum || !formData.experienceYears || !formData.locationAddress || 
        !formData.locationCity || !formData.lessonLocation) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to submit application');
        return;
      }

      // Get user profile for name
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      const { data: insertedTeacher, error } = await supabase
        .from('teachers')
        .insert({
          id: user.id,
          qualifications: validQualifications,
          subjects: validSubjects,
          curriculum: formData.curriculum,
          experience_years: parseInt(formData.experienceYears),
          location_address: formData.locationAddress,
          location_city: formData.locationCity,
          lesson_location: formData.lessonLocation,
          business_lat: formData.businessLat,
          business_lng: formData.businessLng,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Send application submitted email
      try {
        await supabase.functions.invoke('send-notifications', {
          body: {
            notificationData: {
              recipientEmail: userProfile?.email || user.email,
              recipientName: userProfile?.full_name || 'Teacher',
              notificationType: 'application_submitted',
              title: 'Application Received - Under Review (48 Hours)',
              message: 'Thank you for applying to become a Tuto teacher! Your application has been successfully received and is now under review.',
              additionalData: {
                applicationId: insertedTeacher?.id,
                subjects: validSubjects,
                city: formData.locationCity,
                experience: formData.experienceYears
              }
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't block the application if email fails
      }
      
      toast.success('Teacher application submitted successfully! Check your email for confirmation.');
      onApplicationSubmitted();
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Application submission failed. Please try again.');
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
              Teacher Application
            </CardTitle>
            <p className="text-gray-600">
              Share your qualifications and experience
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Qualifications */}
              <div>
                <Label>Educational Qualifications</Label>
                <div className="space-y-2 mt-2">
                  {formData.qualifications.map((qualification, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder="e.g., Bachelor's Degree in Mathematics"
                        value={qualification}
                        onChange={(e) => updateQualification(index, e.target.value)}
                        className="flex-1"
                      />
                      {formData.qualifications.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeQualification(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQualification}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Qualification
                  </Button>
                </div>
              </div>

              {/* Subjects */}
              <div>
                <Label>Subjects You Can Teach</Label>
                <div className="space-y-2 mt-2">
                  {formData.subjects.map((subject, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder="e.g., Mathematics, English, Science"
                        value={subject}
                        onChange={(e) => updateSubject(index, e.target.value)}
                        className="flex-1"
                      />
                      {formData.subjects.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSubject(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubject}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                  </Button>
                </div>
              </div>

              {/* Curriculum */}
              <div>
                <Label>Curriculum Experience</Label>
                <Select onValueChange={(value) => setFormData(prev => ({...prev, curriculum: value}))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select curriculum type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zimsec">ZIMSEC (Zimbabwe)</SelectItem>
                    <SelectItem value="cambridge">Cambridge International</SelectItem>
                    <SelectItem value="both">Both ZIMSEC & Cambridge</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience */}
              <div>
                <Label htmlFor="experienceYears">Years of Teaching Experience</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="Enter number of years"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData(prev => ({...prev, experienceYears: e.target.value}))}
                  className="mt-1"
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="locationAddress">Your Address</Label>
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

                <div>
                  <Label>Preferred Teaching Location</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({...prev, lessonLocation: value}))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Where do you prefer to teach?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student_home">At Student's Home</SelectItem>
                      <SelectItem value="my_home">At My Home</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="flexible">Flexible/Any Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {formData.businessLat && formData.businessLng
                      ? `Business location set: ${formData.businessLat.toFixed(5)}, ${formData.businessLng.toFixed(5)}`
                      : 'No live business location set yet'}
                  </div>
                  <Button type="button" variant="secondary" onClick={useMyBusinessLocation}>
                    Use My Current Location
                  </Button>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Tell us more about your teaching philosophy, achievements, or anything else you'd like us to know..."
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData(prev => ({...prev, additionalInfo: e.target.value}))}
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Your application will be reviewed within 3-5 business days</li>
                  <li>• We'll verify your qualifications and experience</li>
                  <li>• Once approved, you'll start earning 90% of subscription fees</li>
                  <li>• You'll receive notifications for new student requests</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-orange-600 text-white py-6 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting Application...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500">
          All information will be verified. False information may result in rejection.
        </p>
      </div>
    </div>
  );
};

export default TeacherApplication;
