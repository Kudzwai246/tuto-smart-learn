import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Note: This edge function is kept as a backup/fallback
// The app now primarily uses EmailJS for emails (no domain verification required)
// This function can be used for server-side notifications if needed in the future

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationData {
  recipientEmail: string;
  recipientName: string;
  notificationType: string;
  title: string;
  message: string;
  additionalData?: any;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== send-notifications function invoked ===');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { notificationData }: { notificationData: NotificationData } = body;

    console.log('Notification received (EmailJS handles emails now):', {
      type: notificationData?.notificationType,
      recipient: notificationData?.recipientEmail,
    });

    // This function now just logs - emails are sent via EmailJS from frontend
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification logged. Emails are handled by EmailJS.',
        notificationType: notificationData?.notificationType,
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
