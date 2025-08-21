import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TeacherRatingFormProps {
  teacherId: string;
  studentId: string;
  onRatingSubmitted: () => void;
  onCancel: () => void;
}

const StarRating: React.FC<{
  value: number;
  onChange: (value: number) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export const TeacherRatingForm: React.FC<TeacherRatingFormProps> = ({
  teacherId,
  studentId,
  onRatingSubmitted,
  onCancel
}) => {
  const [ratings, setRatings] = useState({
    overall: 0,
    teaching_quality: 0,
    communication: 0,
    punctuality: 0,
    subject_knowledge: 0
  });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ratings.overall === 0) {
      toast({
        title: "Rating required",
        description: "Please provide an overall rating.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('ratings')
        .insert({
          teacher_id: teacherId,
          student_id: studentId,
          rating: ratings.overall,
          teaching_quality: ratings.teaching_quality || null,
          communication: ratings.communication || null,
          punctuality: ratings.punctuality || null,
          subject_knowledge: ratings.subject_knowledge || null,
          comment: comment || null
        });

      if (error) throw error;

      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });

      onRatingSubmitted();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Rate Your Teacher
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <StarRating
            value={ratings.overall}
            onChange={(value) => setRatings(prev => ({ ...prev, overall: value }))}
            label="Overall Rating *"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StarRating
              value={ratings.teaching_quality}
              onChange={(value) => setRatings(prev => ({ ...prev, teaching_quality: value }))}
              label="Teaching Quality"
            />
            <StarRating
              value={ratings.communication}
              onChange={(value) => setRatings(prev => ({ ...prev, communication: value }))}
              label="Communication"
            />
            <StarRating
              value={ratings.punctuality}
              onChange={(value) => setRatings(prev => ({ ...prev, punctuality: value }))}
              label="Punctuality"
            />
            <StarRating
              value={ratings.subject_knowledge}
              onChange={(value) => setRatings(prev => ({ ...prev, subject_knowledge: value }))}
              label="Subject Knowledge"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments (Optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this teacher..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || ratings.overall === 0}
              className="bg-gradient-primary"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};