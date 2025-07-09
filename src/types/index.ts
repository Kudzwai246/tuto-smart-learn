
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: Location;
  type: 'student' | 'teacher';
  createdAt: Date;
}

export interface Student extends User {
  type: 'student';
  educationLevel: 'primary' | 'olevel' | 'alevel';
  subscriptions: Subscription[];
  preferredLessonType: 'individual' | 'group';
}

export interface Teacher extends User {
  type: 'teacher';
  qualifications: string[];
  subjects: string[];
  approved: boolean;
  rating: number;
  lessonLocation: string;
  curriculum: string;
  experience: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
}

export interface Subscription {
  id: string;
  studentId: string;
  teacherId: string;
  subject: string;
  type: 'individual' | 'group';
  educationLevel: 'primary' | 'olevel' | 'alevel';
  price: number;
  duration: 'monthly' | 'yearly';
  status: 'active' | 'pending' | 'expired';
  startDate: Date;
  endDate: Date;
}

export interface PricingPlan {
  level: 'primary' | 'olevel' | 'alevel';
  individual: {
    monthly: number;
    yearly: number;
  };
  group: {
    monthly: number;
    yearly: number;
  };
}
