
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

export const PRICING_PLANS: Record<EducationLevel, PricingPlan> = {
  primary_grade_1: {
    individual: { monthly: 20, yearly: 200 },
    group: { monthly: 4, yearly: 40 }
  },
  primary_grade_2: {
    individual: { monthly: 20, yearly: 200 },
    group: { monthly: 4, yearly: 40 }
  },
  primary_grade_3: {
    individual: { monthly: 22, yearly: 220 },
    group: { monthly: 4.5, yearly: 45 }
  },
  primary_grade_4: {
    individual: { monthly: 22, yearly: 220 },
    group: { monthly: 4.5, yearly: 45 }
  },
  primary_grade_5: {
    individual: { monthly: 25, yearly: 250 },
    group: { monthly: 5, yearly: 50 }
  },
  primary_grade_6: {
    individual: { monthly: 25, yearly: 250 },
    group: { monthly: 5, yearly: 50 }
  },
  primary_grade_7: {
    individual: { monthly: 28, yearly: 280 },
    group: { monthly: 5.5, yearly: 55 }
  },
  olevel_form_1: {
    individual: { monthly: 35, yearly: 350 },
    group: { monthly: 6, yearly: 60 }
  },
  olevel_form_2: {
    individual: { monthly: 35, yearly: 350 },
    group: { monthly: 6, yearly: 60 }
  },
  olevel_form_3: {
    individual: { monthly: 40, yearly: 400 },
    group: { monthly: 7, yearly: 70 }
  },
  olevel_form_4: {
    individual: { monthly: 45, yearly: 450 },
    group: { monthly: 8, yearly: 80 }
  },
  alevel_form_5_arts: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 10, yearly: 100 }
  },
  alevel_form_5_sciences: {
    individual: { monthly: 55, yearly: 550 },
    group: { monthly: 11, yearly: 110 }
  },
  alevel_form_5_commercials: {
    individual: { monthly: 50, yearly: 500 },
    group: { monthly: 10, yearly: 100 }
  },
  alevel_form_6_arts: {
    individual: { monthly: 55, yearly: 550 },
    group: { monthly: 11, yearly: 110 }
  },
  alevel_form_6_sciences: {
    individual: { monthly: 60, yearly: 600 },
    group: { monthly: 12, yearly: 120 }
  },
  alevel_form_6_commercials: {
    individual: { monthly: 55, yearly: 550 },
    group: { monthly: 11, yearly: 110 }
  }
};
