import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Plus, X, Upload, FileText, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import TutoLogo from './TutoLogo';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

interface TeacherApplicationProps {
  onBack: () => void;
  onApplicationSubmitted: () => void;
}

const TeacherApplication: React.FC<TeacherApplicationProps> = ({ onBack, onApplicationSubmitted }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: '',
    email: '',
    phone: '',
    
    // Step 2: Professional Info
    qualifications: [''],
    subjects: [''],
    curriculum: '',
    experienceYears: '',
    teachingMethodology: '',
    specializations: [''],
    
    // Step 3: Location & Documents
    locationAddress: '',
    locationCity: '',
    lessonLocation: '',
    businessLat: null as number | null,
    businessLng: null as number | null,
    
    // Step 4: Additional
    additionalInfo: ''
  });

  const [documents, setDocuments] = useState({
    idDocument: null as File | null,
    certificates: [] as File[]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const progressPercentage = (currentStep / totalSteps) * 100;

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

  const addSpecialization = () => {
    setFormData(prev => ({
      ...prev,
      specializations: [...prev.specializations, '']
    }));
  };

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const updateSpecialization = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.map((spec, i) => i === index ? value : spec)
    }));
  };

  const handleFileChange = (type: 'idDocument' | 'certificates', files: FileList | null) => {
    if (!files) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const validFiles = Array.from(files).filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    if (type === 'idDocument' && validFiles.length > 0) {
      setDocuments(prev => ({ ...prev, idDocument: validFiles[0] }));
      toast.success('ID document selected');
    } else if (type === 'certificates') {
      setDocuments(prev => ({ 
        ...prev, 
        certificates: [...prev.certificates, ...validFiles] 
      }));
      toast.success(`${validFiles.length} certificate(s) added`);
    }
  };

  const removeCertificate = (index: number) => {
    setDocuments(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.phone) {
          toast.error('Please fill in all personal information');
          return false;
        }
        return true;
      case 2:
        const validQuals = formData.qualifications.filter(q => q.trim() !== '');
        const validSubjects = formData.subjects.filter(s => s.trim() !== '');
        if (validQuals.length === 0 || validSubjects.length === 0 || 
            !formData.curriculum || !formData.experienceYears) {
          toast.error('Please fill in all professional information');
          return false;
        }
        return true;
      case 3:
        if (!formData.locationAddress || !formData.locationCity || !formData.lessonLocation) {
          toast.error('Please fill in all location information');
          return false;
        }
        if (!documents.idDocument) {
          toast.error('Please upload your ID document');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const uploadDocuments = async (teacherId: string) => {
    const uploadedDocs = [];

    try {
      // Upload ID document
      if (documents.idDocument) {
        const idFileName = `${teacherId}/id_${Date.now()}_${documents.idDocument.name}`;
        const { error: idError } = await supabase.storage
          .from('teacher-docs')
          .upload(idFileName, documents.idDocument);

        if (idError) throw idError;

        const { error: dbError } = await supabase
          .from('teacher_documents')
          .insert({
            teacher_id: teacherId,
            doc_type: 'id',
            file_path: idFileName,
            status: 'pending'
          });

        if (dbError) throw dbError;
        uploadedDocs.push('ID');
      }

      // Upload certificates
      for (const cert of documents.certificates) {
        const certFileName = `${teacherId}/cert_${Date.now()}_${cert.name}`;
        const { error: certError } = await supabase.storage
          .from('teacher-docs')
          .upload(certFileName, cert);

        if (certError) throw certError;

        const { error: dbError } = await supabase
          .from('teacher_documents')
          .insert({
            teacher_id: teacherId,
            doc_type: 'certificate',
            file_path: certFileName,
            status: 'pending'
          });

        if (dbError) throw dbError;
        uploadedDocs.push('Certificate');
      }

      return uploadedDocs;
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setUploadingDocs(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to submit application');
        return;
      }

      const validQualifications = formData.qualifications.filter(q => q.trim() !== '');
      const validSubjects = formData.subjects.filter(s => s.trim() !== '');
      const validSpecializations = formData.specializations.filter(s => s.trim() !== '');

      // Insert teacher application
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
          teaching_methodology: formData.teachingMethodology,
          specializations: validSpecializations.length > 0 ? validSpecializations : null,
          status: 'pending',
          approved: false
        })
        .select()
        .single();

      if (error) throw error;

      // Upload documents
      const uploadedDocs = await uploadDocuments(user.id);
      toast.success(`Uploaded ${uploadedDocs.length} document(s)`);

      // Update profile with application data
      await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone
        })
        .eq('id', user.id);

      // Send application submitted email
      try {
        await supabase.functions.invoke('send-notifications', {
          body: {
            notificationData: {
              recipientEmail: formData.email,
              recipientName: formData.fullName,
              notificationType: 'application_submitted',
              title: 'Application Received - Under Review (48 Hours)',
              message: 'Thank you for applying to become a Tuto teacher! Your application has been successfully received and is now under review.',
              additionalData: {
                applicationId: insertedTeacher?.id,
                subjects: validSubjects,
                city: formData.locationCity,
                experience: formData.experienceYears,
                documentsUploaded: uploadedDocs.length
              }
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      toast.success('Teacher application submitted successfully! Check your email for confirmation.');
      onApplicationSubmitted();
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Application submission failed. Please try again.');
    } finally {
      setIsLoading(false);
      setUploadingDocs(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="e.g., John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., john@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., +263 77 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Educational Qualifications *</Label>
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

            <div>
              <Label>Subjects You Can Teach *</Label>
              <div className="space-y-2 mt-2">
                {formData.subjects.map((subject, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="e.g., Mathematics, Physics"
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

            <div>
              <Label>Curriculum Experience *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, curriculum: value }))} value={formData.curriculum}>
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

            <div>
              <Label htmlFor="experienceYears">Years of Teaching Experience *</Label>
              <Input
                id="experienceYears"
                type="number"
                min="0"
                max="50"
                placeholder="Enter number of years"
                value={formData.experienceYears}
                onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="teachingMethodology">Teaching Methodology (Optional)</Label>
              <Textarea
                id="teachingMethodology"
                placeholder="Describe your teaching approach and methods..."
                value={formData.teachingMethodology}
                onChange={(e) => setFormData(prev => ({ ...prev, teachingMethodology: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label>Specializations (Optional)</Label>
              <div className="space-y-2 mt-2">
                {formData.specializations.map((spec, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="e.g., Special Needs Education, Gifted Students"
                      value={spec}
                      onChange={(e) => updateSpecialization(index, e.target.value)}
                      className="flex-1"
                    />
                    {formData.specializations.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSpecialization(index)}
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
                  onClick={addSpecialization}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Specialization
                </Button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="locationAddress">Your Address *</Label>
              <div className="relative mt-1">
                <Input
                  id="locationAddress"
                  type="text"
                  placeholder="Enter your full address"
                  value={formData.locationAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, locationAddress: e.target.value }))}
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label htmlFor="locationCity">City/Area *</Label>
              <Input
                id="locationCity"
                type="text"
                placeholder="e.g., Harare, Bulawayo, Gweru"
                value={formData.locationCity}
                onChange={(e) => setFormData(prev => ({ ...prev, locationCity: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Preferred Teaching Location *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, lessonLocation: value }))} value={formData.lessonLocation}>
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

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="text-sm">
                {formData.businessLat && formData.businessLng
                  ? `📍 Location: ${formData.businessLat.toFixed(5)}, ${formData.businessLng.toFixed(5)}`
                  : '📍 No GPS location set'}
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={useMyBusinessLocation}>
                Use My Location
              </Button>
            </div>

            <div className="border-t border-border pt-4 mt-6">
              <h3 className="font-semibold mb-3">Document Upload *</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>ID Document (Required)</Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {documents.idDocument ? (
                          <>
                            <CheckCircle className="w-10 h-10 text-success mb-2" />
                            <p className="text-sm text-foreground font-medium">{documents.idDocument.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(documents.idDocument.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Upload ID (PDF, JPG, PNG)</p>
                            <p className="text-xs text-muted-foreground">Max 10MB</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('idDocument', e.target.files)}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Certificates (Optional)</Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileText className="w-10 h-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Upload Certificates</p>
                        <p className="text-xs text-muted-foreground">Multiple files allowed (Max 10MB each)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={(e) => handleFileChange('certificates', e.target.files)}
                      />
                    </label>
                  </div>
                  {documents.certificates.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {documents.certificates.map((cert, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm">{cert.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCertificate(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Tell us more about your teaching philosophy, achievements, or anything else you'd like us to know..."
                value={formData.additionalInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                className="mt-1"
                rows={5}
              />
            </div>

            <div className="glass border-border/50 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-primary">Application Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subjects:</span>
                  <span className="font-medium">{formData.subjects.filter(s => s).length} subjects</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="font-medium">{formData.experienceYears} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{formData.locationCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Document:</span>
                  <span className="font-medium">{documents.idDocument ? '✓ Uploaded' : '✗ Missing'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificates:</span>
                  <span className="font-medium">{documents.certificates.length} file(s)</span>
                </div>
              </div>
            </div>

            <div className="glass bg-primary/5 border-primary/20 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2">What happens next?</h3>
              <ul className="text-sm text-foreground space-y-1">
                <li>• Your application will be reviewed within 48 hours</li>
                <li>• We'll verify your qualifications and documents</li>
                <li>• Once approved, you'll start earning 90% of subscription fees</li>
                <li>• You'll receive email notifications about your application status</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <TutoLogo size="sm" />
          <div className="w-10"></div>
        </div>

        {/* Progress Indicator */}
        <Card className="glass border-border/50 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span className={currentStep === 1 ? 'text-primary font-medium' : ''}>Personal</span>
                <span className={currentStep === 2 ? 'text-primary font-medium' : ''}>Professional</span>
                <span className={currentStep === 3 ? 'text-primary font-medium' : ''}>Location & Docs</span>
                <span className={currentStep === 4 ? 'text-primary font-medium' : ''}>Review</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form Card */}
        <Card className="glass border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {currentStep === 1 && 'Personal Information'}
              {currentStep === 2 && 'Professional Details'}
              {currentStep === 3 && 'Location & Documents'}
              {currentStep === 4 && 'Review & Submit'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Let\'s start with your basic information'}
              {currentStep === 2 && 'Tell us about your teaching qualifications'}
              {currentStep === 3 && 'Where you teach and verify your credentials'}
              {currentStep === 4 && 'Review your application before submitting'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="border-border/50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="gradient-primary ml-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="gradient-primary ml-auto"
                  disabled={isLoading || uploadingDocs}
                >
                  {uploadingDocs ? 'Uploading Documents...' : isLoading ? 'Submitting...' : 'Submit Application'}
                  {!isLoading && !uploadingDocs && <CheckCircle className="w-4 h-4 ml-2" />}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          All information will be verified. False information may result in rejection.
        </p>
      </div>
    </div>
  );
};

export default TeacherApplication;
