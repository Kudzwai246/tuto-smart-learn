import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, DollarSign, Users, Target, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PRICING_PLANS, VOCATIONAL_PRICING } from '@/data/pricing';
import { supabase } from '@/integrations/supabase/client';

interface EarningsCalculatorProps {
  teacherId?: string;
}

interface IncomeProjection {
  one_on_one_students: number;
  group_students: number;
  monthly_revenue: number;
  teacher_share: number;
}

interface ProjectionResult {
  teacherShare: number;
  monthlyRevenue: number;
  weeklyHours: number;
  gapTo300: number;
}

const TeacherEarningsCalculator: React.FC<EarningsCalculatorProps> = ({ teacherId }) => {
  const [formData, setFormData] = useState({
    subjects: [''],
    format: 'one_on_one' as 'one_on_one' | 'group',
    pricePerStudent: 50,
    groupSize: 1,
    sessionsPerWeek: 1,
    weeksPerMonth: 4,
    platformCut: 10,
    otherIncome: 0,
    isVocational: false
  });

  const [projection, setProjection] = useState<ProjectionResult | null>(null);
  const [realTimeData, setRealTimeData] = useState<IncomeProjection | null>(null);

  useEffect(() => {
    if (teacherId) {
      fetchRealTimeProjection();
    }
  }, [teacherId]);

  const fetchRealTimeProjection = async () => {
    if (!teacherId) return;
    
    try {
      const { data, error } = await supabase.rpc('get_teacher_income_projection', {
        _teacher_id: teacherId
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setRealTimeData(data[0]);
      }
    } catch (error) {
      console.error('Error fetching real-time projection:', error);
    }
  };

  const updateSubject = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map((s, i) => i === index ? value : s)
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

  const calculateProjection = () => {
    const { pricePerStudent, groupSize, sessionsPerWeek, weeksPerMonth, platformCut, otherIncome, format } = formData;
    
    // teacher_share_per_student_per_month = price_usd * (1 - platform_cut)
    const teacherSharePerStudent = pricePerStudent * (1 - platformCut / 100);
    
    let monthlyIncome = 0;
    let weeklyHours = 0;
    
    if (format === 'one_on_one') {
      // monthly_income_from_one_on_one = teacher_share_per_student_per_month * number_of_one_on_one_students
      monthlyIncome = teacherSharePerStudent * groupSize; // groupSize represents number of individual students
      weeklyHours = sessionsPerWeek * groupSize; // 1 hour per session assumed
    } else {
      // monthly_income_from_groups = teacher_share_per_student_per_month * average_group_size * number_of_group_slots
      monthlyIncome = teacherSharePerStudent * groupSize * 1; // 1 group slot
      weeklyHours = sessionsPerWeek; // One group session
    }
    
    // monthly_income_total = monthly_income_from_one_on_one + monthly_income_from_groups + other_income
    const totalIncome = monthlyIncome + otherIncome;
    
    const gapTo300 = Math.max(0, 300 - totalIncome);
    
    setProjection({
      teacherShare: totalIncome,
      monthlyRevenue: totalIncome / (1 - platformCut / 100), // Back-calculate total revenue
      weeklyHours,
      gapTo300
    });
  };

  const updatePriceFromEducationLevel = (level: string) => {
    // Default to primary pricing for vocational if toggle is on
    if (formData.isVocational) {
      const price = formData.format === 'one_on_one' 
        ? VOCATIONAL_PRICING.individual.monthly 
        : VOCATIONAL_PRICING.group.monthly;
      setFormData(prev => ({ ...prev, pricePerStudent: price }));
    } else {
      const pricing = PRICING_PLANS[level as keyof typeof PRICING_PLANS];
      if (pricing) {
        const price = formData.format === 'one_on_one' 
          ? pricing.individual.monthly 
          : pricing.group.monthly;
        setFormData(prev => ({ ...prev, pricePerStudent: price }));
      }
    }
  };

  const handleFormatChange = (format: 'one_on_one' | 'group') => {
    setFormData(prev => ({ ...prev, format }));
    // Update price based on new format
    if (formData.isVocational) {
      const price = format === 'one_on_one' 
        ? VOCATIONAL_PRICING.individual.monthly 
        : VOCATIONAL_PRICING.group.monthly;
      setFormData(prev => ({ ...prev, pricePerStudent: price }));
    }
  };

  const studentsNeededFor300 = formData.pricePerStudent * (1 - formData.platformCut / 100) > 0 
    ? Math.ceil(300 / (formData.pricePerStudent * (1 - formData.platformCut / 100)))
    : 0;

  return (
    <div className="space-y-6">
      {/* Real-time data if available */}
      {realTimeData && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <DollarSign className="w-5 h-5 mr-2" />
              Current Performance (Real Data)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-blue-600 font-medium">One-on-One Students</p>
                <p className="text-xl font-bold text-blue-800">{realTimeData.one_on_one_students}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Group Students</p>
                <p className="text-xl font-bold text-blue-800">{realTimeData.group_students}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Monthly Revenue</p>
                <p className="text-xl font-bold text-blue-800">${realTimeData.monthly_revenue}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Your Share (90%)</p>
                <p className="text-xl font-bold text-blue-800">${realTimeData.teacher_share}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Income Calculator & Planner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subjects */}
          <div>
            <Label>Subjects You'll Teach</Label>
            <div className="space-y-2 mt-2">
              {formData.subjects.map((subject, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    placeholder="e.g., Mathematics, English"
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
                      Remove
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
                Add Subject
              </Button>
            </div>
          </div>

          {/* Vocational Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="vocational"
              checked={formData.isVocational}
              onChange={(e) => setFormData(prev => ({ ...prev, isVocational: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="vocational">Vocational Teaching (+20% pricing)</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Format */}
            <div>
              <Label>Teaching Format</Label>
              <Select 
                value={formData.format} 
                onValueChange={(value: 'one_on_one' | 'group') => handleFormatChange(value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_on_one">One-on-One</SelectItem>
                  <SelectItem value="group">Group (Max 10 students)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div>
              <Label>Price per Student (USD/month)</Label>
              <Input
                type="number"
                value={formData.pricePerStudent}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerStudent: parseFloat(e.target.value) || 0 }))}
                className="mt-1"
                min="0"
                step="0.01"
              />
            </div>

            {/* Group Size / Number of Students */}
            <div>
              <Label>
                {formData.format === 'one_on_one' 
                  ? 'Number of Individual Students' 
                  : 'Group Size (Current/Expected)'
                }
              </Label>
              <Input
                type="number"
                value={formData.groupSize}
                onChange={(e) => setFormData(prev => ({ ...prev, groupSize: parseInt(e.target.value) || 1 }))}
                className="mt-1"
                min="1"
                max={formData.format === 'group' ? 10 : 50}
              />
            </div>

            {/* Sessions per week */}
            <div>
              <Label>Sessions per Week</Label>
              <Input
                type="number"
                value={formData.sessionsPerWeek}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionsPerWeek: parseInt(e.target.value) || 1 }))}
                className="mt-1"
                min="1"
                max="7"
              />
            </div>

            {/* Platform Cut */}
            <div>
              <Label>Platform Commission (%)</Label>
              <Input
                type="number"
                value={formData.platformCut}
                onChange={(e) => setFormData(prev => ({ ...prev, platformCut: parseFloat(e.target.value) || 10 }))}
                className="mt-1"
                min="0"
                max="50"
                step="0.1"
              />
            </div>

            {/* Other Income */}
            <div>
              <Label>Other Monthly Income (USD)</Label>
              <Input
                type="number"
                value={formData.otherIncome}
                onChange={(e) => setFormData(prev => ({ ...prev, otherIncome: parseFloat(e.target.value) || 0 }))}
                className="mt-1"
                min="0"
                step="0.01"
                placeholder="Equipment fees, surcharges, etc."
              />
            </div>
          </div>

          <Button onClick={calculateProjection} className="w-full">
            Calculate Income Projection
          </Button>

          {projection && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Projection Results
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ${projection.teacherShare.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Projected Monthly Income</p>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {projection.weeklyHours}
                    </p>
                    <p className="text-sm text-gray-500">Weekly Teaching Hours</p>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      ${projection.gapTo300?.toFixed(2) || 0}
                    </p>
                    <p className="text-sm text-gray-500">Gap to $300</p>
                  </div>
                </Card>
              </div>

              {/* Helpful insights */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold text-orange-800">Quick Insights:</p>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• To reach $300/month, you need {studentsNeededFor300} students at current pricing</li>
                      <li>• Your hourly rate: ${projection.teacherShare > 0 ? (projection.teacherShare / (projection.weeklyHours * formData.weeksPerMonth)).toFixed(2) : '0'}/hour</li>
                      <li>• Platform takes {formData.platformCut}%, you keep {100 - formData.platformCut}%</li>
                      {formData.format === 'group' && (
                        <li>• Group teaching can be more profitable per hour than 1-on-1</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  Create New Group
                </Button>
                <Button variant="outline" className="flex-1">
                  Open Trial Seats
                </Button>
                <Button variant="outline" className="flex-1">
                  Promote Listing
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherEarningsCalculator;
