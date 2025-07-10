
// Education levels with specific Zimbabwean structure
export type EducationLevel = 
  // Primary levels (Grade 1-7)
  | 'primary_grade_1' | 'primary_grade_2' | 'primary_grade_3' | 'primary_grade_4' 
  | 'primary_grade_5' | 'primary_grade_6' | 'primary_grade_7'
  // O-Level (Form 1-4)
  | 'olevel_form_1' | 'olevel_form_2' | 'olevel_form_3' | 'olevel_form_4'
  // A-Level (Form 5-6) with specializations
  | 'alevel_form_5_arts' | 'alevel_form_5_sciences' | 'alevel_form_5_commercials'
  | 'alevel_form_6_arts' | 'alevel_form_6_sciences' | 'alevel_form_6_commercials';

export const EDUCATION_LEVELS = [
  // Primary School
  { value: 'primary_grade_1', label: 'Primary - Grade 1' },
  { value: 'primary_grade_2', label: 'Primary - Grade 2' },
  { value: 'primary_grade_3', label: 'Primary - Grade 3' },
  { value: 'primary_grade_4', label: 'Primary - Grade 4' },
  { value: 'primary_grade_5', label: 'Primary - Grade 5' },
  { value: 'primary_grade_6', label: 'Primary - Grade 6' },
  { value: 'primary_grade_7', label: 'Primary - Grade 7' },
  // O-Level
  { value: 'olevel_form_1', label: 'O-Level - Form 1' },
  { value: 'olevel_form_2', label: 'O-Level - Form 2' },
  { value: 'olevel_form_3', label: 'O-Level - Form 3' },
  { value: 'olevel_form_4', label: 'O-Level - Form 4' },
  // A-Level
  { value: 'alevel_form_5_arts', label: 'A-Level - Form 5 (Arts)' },
  { value: 'alevel_form_5_sciences', label: 'A-Level - Form 5 (Sciences)' },
  { value: 'alevel_form_5_commercials', label: 'A-Level - Form 5 (Commercials)' },
  { value: 'alevel_form_6_arts', label: 'A-Level - Form 6 (Arts)' },
  { value: 'alevel_form_6_sciences', label: 'A-Level - Form 6 (Sciences)' },
  { value: 'alevel_form_6_commercials', label: 'A-Level - Form 6 (Commercials)' },
] as const;

// Payment methods available in Zimbabwe
export const PAYMENT_METHODS = [
  { value: 'ecocash', label: 'EcoCash Mobile Money' },
  { value: 'onemoney', label: 'OneMoney' },
  { value: 'telecash', label: 'TeleCash' },
  { value: 'zipit', label: 'ZipIt' },
  { value: 'bank_transfer', label: 'Bank Transfer (USD)' },
  { value: 'visa_mastercard', label: 'Visa/Mastercard (USD)' },
] as const;

export interface PricingPlan {
  individual: {
    monthly: number;
    yearly: number;
  };
  group: {
    monthly: number;
    yearly: number;
  };
}
