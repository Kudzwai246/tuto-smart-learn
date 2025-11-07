import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { ApplicationSubmittedEmail } from "./_templates/application-submitted.tsx";
import { AccountApprovedEmail } from "./_templates/account-approved.tsx";
import { AccountRejectedEmail } from "./_templates/account-rejected.tsx";

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

    let emailContent: string;

    // Use React Email templates for better HTML emails
    switch (notificationData.notificationType) {
      case 'application_submitted':
        emailContent = await renderAsync(
          React.createElement(ApplicationSubmittedEmail, {
            recipientName: notificationData.recipientName,
            applicationId: notificationData.additionalData?.applicationId,
            subjects: notificationData.additionalData?.subjects,
            city: notificationData.additionalData?.city,
            experience: notificationData.additionalData?.experience,
            documentsUploaded: notificationData.additionalData?.documentsUploaded,
          })
        );
        break;

      case 'account_approved':
        emailContent = await renderAsync(
          React.createElement(AccountApprovedEmail, {
            recipientName: notificationData.recipientName,
            recipientEmail: notificationData.recipientEmail,
            subjects: notificationData.additionalData?.subjects,
            city: notificationData.additionalData?.city,
            experience: notificationData.additionalData?.experience,
          })
        );
        break;

      case 'account_rejected':
        emailContent = await renderAsync(
          React.createElement(AccountRejectedEmail, {
            recipientName: notificationData.recipientName,
            rejectionReason: notificationData.additionalData?.rejectionReason,
          })
        );
        break;

      default:
        // Fallback to simple template for other notification types
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1E88E5; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Tuto</h1>
              <p style="margin: 10px 0 0 0;">Quality Education at Affordable Prices</p>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Hello ${notificationData.recipientName},</h2>
              
              <div style="background-color: white; padding: 20px; margin: 15px 0; border-radius: 5px;">
                <h3>${notificationData.title}</h3>
                <p>${notificationData.message}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%); color: white; border-radius: 5px;">
                <p style="margin: 10px 0;">Thank you for being part of the Tuto community!</p>
                <p style="margin: 10px 0;"><strong>Kudzwai Madyavanhu</strong><br>CEO & Co-Founder, Tuto</p>
              </div>
            </div>
          </div>
        `;
    }

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
