import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Award, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Qualification {
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

interface TeacherQualificationFormProps {
  teacherId: string;
}

export const TeacherQualificationForm: React.FC<TeacherQualificationFormProps> = ({
  teacherId
}) => {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [teachingMethodology, setTeachingMethodology] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeacherData();
  }, [teacherId]);

  const fetchTeacherData = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('qualification_details, teaching_methodology, specializations')
        .eq('id', teacherId)
        .single();

      if (error) throw error;

      setQualifications(data.qualification_details || []);
      setTeachingMethodology(data.teaching_methodology || '');
      setSpecializations(data.specializations || []);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQualification = () => {
    setQualifications([...qualifications, { degree: '', institution: '', year: '', description: '' }]);
  };

  const updateQualification = (index: number, field: keyof Qualification, value: string) => {
    const updated = qualifications.map((qual, i) => 
      i === index ? { ...qual, [field]: value } : qual
    );
    setQualifications(updated);
  };

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !specializations.includes(newSpecialization.trim())) {
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setSpecializations(specializations.filter(s => s !== spec));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('teachers')
        .update({
          qualification_details: qualifications.filter(q => q.degree.trim()),
          teaching_methodology: teachingMethodology,
          specializations: specializations
        })
        .eq('id', teacherId);

      if (error) throw error;

      toast({
        title: "Qualifications updated",
        description: "Your qualifications and teaching information have been updated.",
      });
    } catch (error) {
      console.error('Error updating qualifications:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-muted rounded-lg h-96"></div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Qualifications & Teaching Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Qualifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Academic Qualifications</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQualification}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Qualification
              </Button>
            </div>

            {qualifications.map((qualification, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Qualification {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQualification(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Degree/Certificate</Label>
                    <Input
                      value={qualification.degree}
                      onChange={(e) => updateQualification(index, 'degree', e.target.value)}
                      placeholder="e.g., Bachelor of Science"
                    />
                  </div>
                  <div>
                    <Label>Institution</Label>
                    <Input
                      value={qualification.institution}
                      onChange={(e) => updateQualification(index, 'institution', e.target.value)}
                      placeholder="e.g., University of Zimbabwe"
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      value={qualification.year}
                      onChange={(e) => updateQualification(index, 'year', e.target.value)}
                      placeholder="e.g., 2020"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={qualification.description || ''}
                    onChange={(e) => updateQualification(index, 'description', e.target.value)}
                    placeholder="Additional details about this qualification..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Teaching Methodology */}
          <div className="space-y-2">
            <Label htmlFor="methodology" className="text-lg font-semibold">Teaching Methodology</Label>
            <Textarea
              id="methodology"
              value={teachingMethodology}
              onChange={(e) => setTeachingMethodology(e.target.value)}
              placeholder="Describe your teaching approach, methods, and philosophy..."
              rows={4}
            />
          </div>

          {/* Specializations */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Specializations</Label>
            
            <div className="flex gap-2">
              <Input
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                placeholder="Add a specialization..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSpecialization}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {specializations.map((spec, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialization(spec)}
                    className="ml-2 text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};