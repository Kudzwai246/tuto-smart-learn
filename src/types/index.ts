
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  user_type: 'student' | 'teacher' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface Student extends User {
  user_type: 'student';
  education_level: EducationLevel;
  preferred_lesson_type: 'individual' | 'group';
  location_address: string;
  location_city: string;
  guardian_name: string;
  guardian_email: string;
  guardian_phone: string;
  status: 'active' | 'suspended' | 'inactive';
}

export interface Teacher extends User {
  user_type: 'teacher';
  qualifications: string[];
  subjects: string[];
  curriculum: string;
  experience_years: number;
  location_address: string;
  location_city: string;
  lesson_location: string;
  approved: boolean;
  rating: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
}

export interface Admin extends User {
  user_type: 'admin';
}

export type EducationLevel = 
  | 'primary_grade_1' | 'primary_grade_2' | 'primary_grade_3' | 'primary_grade_4' 
  | 'primary_grade_5' | 'primary_grade_6' | 'primary_grade_7'
  | 'olevel_form_1' | 'olevel_form_2' | 'olevel_form_3' | 'olevel_form_4'
  | 'alevel_form_5_arts' | 'alevel_form_5_sciences' | 'alevel_form_5_commercials'
  | 'alevel_form_6_arts' | 'alevel_form_6_sciences' | 'alevel_form_6_commercials';

export interface Subscription {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: string;
  lesson_type: 'individual' | 'group';
  education_level: EducationLevel;
  price_usd: number;
  duration: 'monthly' | 'yearly';
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  start_date?: Date;
  end_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: string;
  subscription_id: string;
  amount_usd: number;
  payment_method: 'ecocash' | 'cabs' | 'zimbank' | 'other';
  payment_provider?: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paid_at?: Date;
  created_at: Date;
}

export interface ProgressReport {
  id: string;
  subscription_id: string;
  teacher_id: string;
  student_id: string;
  report_period_start: Date;
  report_period_end: Date;
  attendance_percentage?: number;
  performance_rating?: number;
  strengths?: string;
  areas_for_improvement?: string;
  teacher_comments?: string;
  sent_to_guardian_at?: Date;
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'lesson_reminder' | 'payment_due' | 'progress_report' | 'account_approved' | 'general';
  read: boolean;
  sent_at?: Date;
  created_at: Date;
}

export const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
  { value: 'primary_grade_1', label: 'Primary - Grade 1' },
  { value: 'primary_grade_2', label: 'Primary - Grade 2' },
  { value: 'primary_grade_3', label: 'Primary - Grade 3' },
  { value: 'primary_grade_4', label: 'Primary - Grade 4' },
  { value: 'primary_grade_5', label: 'Primary - Grade 5' },
  { value: 'primary_grade_6', label: 'Primary - Grade 6' },
  { value: 'primary_grade_7', label: 'Primary - Grade 7' },
  { value: 'olevel_form_1', label: 'O-Level - Form 1' },
  { value: 'olevel_form_2', label: 'O-Level - Form 2' },
  { value: 'olevel_form_3', label: 'O-Level - Form 3' },
  { value: 'olevel_form_4', label: 'O-Level - Form 4' },
  { value: 'alevel_form_5_arts', label: 'A-Level - Form 5 Arts' },
  { value: 'alevel_form_5_sciences', label: 'A-Level - Form 5 Sciences' },
  { value: 'alevel_form_5_commercials', label: 'A-Level - Form 5 Commercials' },
  { value: 'alevel_form_6_arts', label: 'A-Level - Form 6 Arts' },
  { value: 'alevel_form_6_sciences', label: 'A-Level - Form 6 Sciences' },
  { value: 'alevel_form_6_commercials', label: 'A-Level - Form 6 Commercials' },
];

export const PAYMENT_METHODS = [
  { value: 'ecocash', label: 'EcoCash' },
  { value: 'cabs', label: 'CABS Bank' },
  { value: 'zimbank', label: 'Zimbabwe Banks' },
  { value: 'other', label: 'Other' },
];
