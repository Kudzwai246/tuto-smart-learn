import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationData {
  recipientEmail: string;
  recipientName: string;
  notificationType: 'lesson_reminder' | 'payment_due' | 'account_approved' | 'account_rejected' | 'application_submitted' | 'general';
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

    console.log('Processing notification:', notificationData.notificationType);

    const getEmailTemplate = (data: NotificationData) => {
      const baseTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ff6b35; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Tuto</h1>
            <p style="margin: 10px 0 0 0;">Quality Education at Affordable Prices</p>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Hello ${data.recipientName},</h2>
            
            <div style="background-color: white; padding: 20px; margin: 15px 0; border-radius: 5px;">
              <h3>${data.title}</h3>
              <p>${data.message}</p>
              ${getSpecificContent(data)}
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #ff6b35; color: white; border-radius: 5px;">
              <p style="margin: 10px 0;">Thank you for being part of the Tuto community!</p>
              <p style="margin: 10px 0;"><strong>Kudzwai Madyavanhu</strong><br>CEO & Co-Founder, Tuto</p>
            </div>
          </div>
        </div>
      `;
      return baseTemplate;
    };

    const getSpecificContent = (data: NotificationData) => {
      switch (data.notificationType) {
        case 'application_submitted':
          return `
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <h4 style="margin-top: 0;">Application Details</h4>
              <p><strong>Review Timeline:</strong> Under 48 Hours</p>
              <p><strong>Reference:</strong> TUT-${data.additionalData?.applicationId || 'PENDING'}</p>
              <p style="margin-bottom: 0;"><strong>What happens next?</strong></p>
              <ul style="margin: 10px 0;">
                <li>Our team will review your qualifications</li>
                <li>We'll verify your teaching credentials</li>
                <li>You'll receive an email within 48 hours with our decision</li>
              </ul>
              <p style="margin-top: 15px;"><strong>Need help?</strong> Contact support@tuto.co.zw</p>
            </div>
          `;
        case 'account_approved':
          return `
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <h4 style="margin-top: 0;">🎉 Welcome to Tuto!</h4>
              <p><strong>Your Teacher Credentials:</strong></p>
              <ul style="margin: 10px 0;">
                <li><strong>Name:</strong> ${data.additionalData?.fullName || data.recipientName}</li>
                <li><strong>Email (Username):</strong> ${data.recipientEmail}</li>
                <li><strong>Status:</strong> Active</li>
              </ul>
              
              <p style="margin-top: 15px;"><strong>You can now:</strong></p>
              <ul style="margin: 10px 0;">
                <li>✓ Access your teacher dashboard</li>
                <li>✓ Be discovered by students searching for teachers</li>
                <li>✓ Receive subscription requests from students</li>
                <li>✓ Start earning 90% of lesson fees</li>
              </ul>
              
              <p style="margin-top: 15px;"><strong>Students can now find you based on:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Subjects you teach: ${data.additionalData?.subjects?.join(', ') || 'Multiple subjects'}</li>
                <li>Location: ${data.additionalData?.city || 'Your city'}</li>
                <li>Experience: ${data.additionalData?.experience || 'N/A'} years</li>
              </ul>
              
              <p style="margin-top: 15px;"><strong>Next Steps:</strong></p>
              <ol style="margin: 10px 0;">
                <li>Log in to your teacher dashboard</li>
                <li>Complete your profile (add photo, teaching methodology)</li>
                <li>Set your pricing and availability</li>
                <li>Start accepting students!</li>
              </ol>
            </div>
          `;
        case 'account_rejected':
          return `
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <h4 style="margin-top: 0;">Application Status Update</h4>
              <p>After careful review, we're unable to approve your application at this time.</p>
              <p style="margin-top: 15px;"><strong>Reasons:</strong></p>
              <p>${data.additionalData?.rejectionReason || 'Please contact us for more details.'}</p>
              <p style="margin-top: 15px;"><strong>Next Steps:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Review our teacher requirements</li>
                <li>Update your qualifications if needed</li>
                <li>Reapply after addressing the feedback</li>
              </ul>
              <p style="margin-top: 15px;">Contact support@tuto.co.zw for more information.</p>
            </div>
          `;
        case 'lesson_reminder':
          return `
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <h4 style="margin-top: 0;">Lesson Details</h4>
              <p><strong>Date:</strong> ${data.additionalData?.lessonDate || 'To be confirmed'}</p>
              <p><strong>Time:</strong> ${data.additionalData?.lessonTime || 'To be confirmed'}</p>
              <p><strong>Subject:</strong> ${data.additionalData?.subject || 'N/A'}</p>
            </div>
          `;
        case 'payment_due':
          return `
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <h4 style="margin-top: 0;">Payment Information</h4>
              <p><strong>Amount Due:</strong> $${data.additionalData?.amount || '0.00'} USD</p>
              <p><strong>Due Date:</strong> ${data.additionalData?.dueDate || 'Immediate'}</p>
              <p><strong>Payment Methods:</strong> EcoCash, CABS, Zimbabwe Banks</p>
            </div>
          `;
        default:
          return '';
      }
    };

    const emailContent = getEmailTemplate(notificationData);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Tuto <onboarding@resend.dev>',
      to: [notificationData.recipientEmail],
      subject: notificationData.title,
      html: emailContent,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification email sent successfully',
        recipientEmail: notificationData.recipientEmail,
        emailId: data?.id
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
