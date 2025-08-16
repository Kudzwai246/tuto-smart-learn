
import { EducationLevel } from '@/types';

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

// Simplified pricing per user spec - Primary, O-Level, A-Level + Vocational
export const PRICING_PLANS: Record<EducationLevel, PricingPlan> = {
  // Primary Grades (Grade 1-7) - All same pricing
  primary_grade_1: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 15, yearly: 150 }
  },
  primary_grade_2: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 15, yearly: 150 }
  },
  primary_grade_3: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 15, yearly: 150 }
  },
  primary_grade_4: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 15, yearly: 150 }
  },
  primary_grade_5: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 15, yearly: 150 }
  },
  primary_grade_6: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 15, yearly: 150 }
  },
  primary_grade_7: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 15, yearly: 150 }
  },
  
  // O-Level (Forms 1-4) 
  olevel_form_1: {
    individual: { monthly: 40, yearly: 400 },
    group: { monthly: 7, yearly: 70 }
  },
  olevel_form_2: {
    individual: { monthly: 40, yearly: 400 },
    group: { monthly: 7, yearly: 70 }
  },
  olevel_form_3: {
    individual: { monthly: 40, yearly: 400 },
    group: { monthly: 7, yearly: 70 }
  },
  olevel_form_4: {
    individual: { monthly: 40, yearly: 400 },
    group: { monthly: 7, yearly: 70 }
  },
  
  // A-Level (Forms 5-6) - All same pricing
  alevel_form_5_arts: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 13, yearly: 130 }
  },
  alevel_form_5_sciences: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 13, yearly: 130 }
  },
  alevel_form_5_commercials: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 13, yearly: 130 }
  },
  alevel_form_6_arts: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 13, yearly: 130 }
  },
  alevel_form_6_sciences: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 13, yearly: 130 }
  },
  alevel_form_6_commercials: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 13, yearly: 130 }
  }
};

// Vocational pricing interface
export interface VocationalPricing {
  individual: {
    monthly: number;
    yearly: number;
  };
  group: {
    monthly: number;
    yearly: number;
  };
}

// Vocational pricing (+20% over academic)
export const VOCATIONAL_PRICING: VocationalPricing = {
  individual: { monthly: 60, yearly: 600 },
  group: { monthly: 18, yearly: 180 }
};
