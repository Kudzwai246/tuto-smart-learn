import emailjs from '@emailjs/browser';

// EmailJS Configuration
// User needs to set these up at https://www.emailjs.com/
const EMAILJS_SERVICE_ID = 'service_tuto'; // Replace with your service ID
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your public key

// Template IDs - user creates these in EmailJS dashboard
const TEMPLATES = {
  APPLICATION_SUBMITTED: 'template_app_submitted',
  ACCOUNT_APPROVED: 'template_approved',
  ACCOUNT_REJECTED: 'template_rejected',
};

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

interface ApplicationSubmittedParams {
  recipientName: string;
  recipientEmail: string;
  applicationId: string;
  subjects: string[];
  city: string;
  documentsCount: number;
}

interface AccountApprovedParams {
  recipientName: string;
  recipientEmail: string;
}

interface AccountRejectedParams {
  recipientName: string;
  recipientEmail: string;
  rejectionReason?: string;
}

export const sendApplicationSubmittedEmail = async (params: ApplicationSubmittedParams): Promise<boolean> => {
  try {
    const templateParams = {
      to_name: params.recipientName,
      to_email: params.recipientEmail,
      application_id: params.applicationId,
      subjects: params.subjects.join(', '),
      city: params.city,
      documents_count: params.documentsCount.toString(),
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.APPLICATION_SUBMITTED,
      templateParams
    );

    console.log('Application submitted email sent:', response);
    return response.status === 200;
  } catch (error) {
    console.error('Failed to send application submitted email:', error);
    return false;
  }
};

export const sendAccountApprovedEmail = async (params: AccountApprovedParams): Promise<boolean> => {
  try {
    const templateParams = {
      to_name: params.recipientName,
      to_email: params.recipientEmail,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.ACCOUNT_APPROVED,
      templateParams
    );

    console.log('Account approved email sent:', response);
    return response.status === 200;
  } catch (error) {
    console.error('Failed to send account approved email:', error);
    return false;
  }
};

export const sendAccountRejectedEmail = async (params: AccountRejectedParams): Promise<boolean> => {
  try {
    const templateParams = {
      to_name: params.recipientName,
      to_email: params.recipientEmail,
      rejection_reason: params.rejectionReason || 'Your application did not meet our current requirements.',
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.ACCOUNT_REJECTED,
      templateParams
    );

    console.log('Account rejected email sent:', response);
    return response.status === 200;
  } catch (error) {
    console.error('Failed to send account rejected email:', error);
    return false;
  }
};

// Check if EmailJS is properly configured
export const isEmailJSConfigured = (): boolean => {
  return EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' && EMAILJS_SERVICE_ID !== 'service_tuto';
};
