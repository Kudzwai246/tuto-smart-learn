
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Upload, MapPin, BookOpen } from 'lucide-react';
import TutoLogo from './TutoLogo';
import { toast } from 'sonner';

interface TeacherApplicationProps {
  onBack: () => void;
  onApplicationSubmitted: () => void;
}

const TeacherApplication: React.FC<TeacherApplicationProps> = ({ onBack, onApplicationSubmitted }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualifications: '',
    experience: '',
    subjects: [] as string[],
    teachingLocation: '',
    curriculum: '',
    documents: null as File | null
  });

  const [isLoading, setIsLoading] = useState(false);

  const subjects = [
    'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Literature', 'Economics', 'Accounting', 
    'Computer Science', 'Art', 'Music', 'Physical Education'
  ];

  const handleSubjectChange = (subject: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      subjects: checked 
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({...prev, documents: file}));
      toast.success('Document uploaded successfully');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.qualifications || !formData.subjects.length) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Teacher application data:', formData);
      toast.success('Application submitted successfully! We will review and contact you soon.');
      onApplicationSubmitted();
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Application failed. Please try again.');
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
              Join our network of qualified educators
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
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
                  <Label htmlFor="email">Email Address *</Label>
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
                  <Label htmlFor="phone">Phone Number *</Label>
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

              {/* Professional Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="qualifications">Qualifications *</Label>
                  <Textarea
                    id="qualifications"
                    placeholder="List your educational qualifications and certifications"
                    value={formData.qualifications}
                    onChange={(e) => setFormData(prev => ({...prev, qualifications: e.target.value}))}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Teaching Experience</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({...prev, experience: value}))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Years of teaching experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Subjects You Can Teach *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                    {subjects.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox
                          id={subject}
                          checked={formData.subjects.includes(subject)}
                          onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
                        />
                        <Label htmlFor={subject} className="text-sm">
                          {subject}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="curriculum">Curriculum</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({...prev, curriculum: value}))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select curriculum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zimsec">ZIMSEC</SelectItem>
                      <SelectItem value="cambridge">Cambridge</SelectItem>
                      <SelectItem value="both">Both ZIMSEC & Cambridge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Teaching Location *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="location"
                      type="text"
                      placeholder="Enter your preferred teaching location"
                      value={formData.teachingLocation}
                      onChange={(e) => setFormData(prev => ({...prev, teachingLocation: e.target.value}))}
                      className="pl-10"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="documents">Upload Qualifications Document</Label>
                  <div className="mt-1">
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          {formData.documents ? formData.documents.name : 'Click to upload documents'}
                        </p>
                        <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
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
          Applications are reviewed within 3-5 business days
        </p>
      </div>
    </div>
  );
};

export default TeacherApplication;
