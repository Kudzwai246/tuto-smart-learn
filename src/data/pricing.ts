
import { PricingPlan } from '../types';

export const pricingPlans: PricingPlan[] = [
  {
    level: 'primary',
    individual: {
      monthly: 50,
      yearly: 420
    },
    group: {
      monthly: 15,
      yearly: 120
    }
  },
  {
    level: 'olevel',
    individual: {
      monthly: 40,
      yearly: 360
    },
    group: {
      monthly: 7,
      yearly: 84
    }
  },
  {
    level: 'alevel',
    individual: {
      monthly: 50,
      yearly: 420
    },
    group: {
      monthly: 13,
      yearly: 120
    }
  }
];

export const API_CONFIG = {
  mapsApiKey: 'AIzaSyAwfeiSn22K53uoipJW5hC7CNKf4DTPopg',
  spreadsheetId: '1pjFPATRRZaiDhHLMKNfWAK0DMWAOUekA-ho5nV1ftNY',
  driveUploadsFolderId: '10mlqTYyMs2uJlXw2naQyV6mbDqD-xEwb',
  webAppUrl: 'https://script.google.com/macros/s/AKfycbzlDjz0KklmLlMwI77J_67nMRJOcU2235iQtYK3tbndZ7Vk7-P3I9zhl1ltDAJCqyMvXw/exec',
  scriptId: '12Jt6G9nxg7PRo7-JIACqP39y6TuYtSWKpbDyr5n48_auHUIGlSTcLtMt'
};
