
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationData {
  recipientEmail: string;
  recipientName: string;
  notificationType: 'lesson_reminder' | 'payment_due' | 'account_approved' | 'general';
  title: string;
  message: string;
  additionalData?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notificationData }: { notificationData: NotificationData } = await req.json();

    const getEmailTemplate = (data: NotificationData) => {
      const baseTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ff6b35; color: white; padding: 20px; text-align: center;">
            <h1>Tuto</h1>
            <p>From the Tuto Team & Kudzwai Madyavanhu, CEO & Co-Founder</p>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Hello ${data.recipientName},</h2>
            
            <div style="background-color: white; padding: 20px; margin: 15px 0; border-radius: 5px;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
              ${getSpecificContent(data)}
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #ff6b35; color: white; border-radius: 5px;">
              <p>Thank you for being part of the Tuto community!</p>
              <p><strong>Kudzwai Madyavanhu</strong><br>CEO & Co-Founder, Tuto</p>
              <p>Quality education at affordable prices</p>
            </div>
          </div>
        </div>
      `;
      return baseTemplate;
    };

    const getSpecificContent = (data: NotificationData) => {
      switch (data.notificationType) {
        case 'lesson_reminder':
          return `
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <h4>Lesson Details</h4>
              <p><strong>Date:</strong> ${data.additionalData?.lessonDate || 'To be confirmed'}</p>
              <p><strong>Time:</strong> ${data.additionalData?.lessonTime || 'To be confirmed'}</p>
              <p><strong>Subject:</strong> ${data.additionalData?.subject || 'N/A'}</p>
            </div>
          `;
        case 'payment_due':
          return `
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <h4>Payment Information</h4>
              <p><strong>Amount Due:</strong> $${data.additionalData?.amount || '0.00'} USD</p>
              <p><strong>Due Date:</strong> ${data.additionalData?.dueDate || 'Immediate'}</p>
              <p><strong>Payment Methods:</strong> EcoCash, CABS, Zimbabwe Banks</p>
            </div>
          `;
        case 'account_approved':
          return `
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <h4>Welcome to Tuto!</h4>
              <p>Your account has been approved and you can now start ${data.additionalData?.userType === 'teacher' ? 'teaching students' : 'learning with qualified teachers'}.</p>
            </div>
          `;
        default:
          return '';
      }
    };

    const emailContent = getEmailTemplate(notificationData);

    // Here you would integrate with your email service
    console.log('Notification email to be sent:', {
      to: notificationData.recipientEmail,
      subject: notificationData.title,
      html: emailContent
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification email queued for sending',
        recipientEmail: notificationData.recipientEmail
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
