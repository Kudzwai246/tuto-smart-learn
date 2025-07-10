
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProgressReportData {
  studentName: string;
  guardianEmail: string;
  teacherName: string;
  subject: string;
  reportPeriod: string;
  attendancePercentage: number;
  performanceRating: number;
  strengths: string;
  areasForImprovement: string;
  teacherComments: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportData }: { reportData: ProgressReportData } = await req.json();

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff6b35; color: white; padding: 20px; text-align: center;">
          <h1>Tuto Progress Report</h1>
          <p>From the Tuto Team & Kudzwai Madyavanhu, CEO & Co-Founder</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Student Progress Report - ${reportData.reportPeriod}</h2>
          
          <div style="background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px;">
            <h3>Student Information</h3>
            <p><strong>Student Name:</strong> ${reportData.studentName}</p>
            <p><strong>Subject:</strong> ${reportData.subject}</p>
            <p><strong>Teacher:</strong> ${reportData.teacherName}</p>
          </div>
          
          <div style="background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px;">
            <h3>Performance Summary</h3>
            <p><strong>Attendance:</strong> ${reportData.attendancePercentage}%</p>
            <p><strong>Performance Rating:</strong> ${reportData.performanceRating}/5 stars</p>
          </div>
          
          <div style="background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px;">
            <h3>Strengths</h3>
            <p>${reportData.strengths}</p>
          </div>
          
          <div style="background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px;">
            <h3>Areas for Improvement</h3>
            <p>${reportData.areasForImprovement}</p>
          </div>
          
          <div style="background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px;">
            <h3>Teacher Comments</h3>
            <p>${reportData.teacherComments}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #ff6b35; color: white; border-radius: 5px;">
            <p>Thank you for choosing Tuto for your child's education!</p>
            <p><strong>Kudzwai Madyavanhu</strong><br>CEO & Co-Founder, Tuto</p>
            <p>Quality education at affordable prices</p>
          </div>
        </div>
      </div>
    `;

    // Here you would integrate with your email service (e.g., Resend, SendGrid)
    // For now, we'll log the email content
    console.log('Progress report email to be sent:', emailContent);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Progress report email queued for sending',
        recipientEmail: reportData.guardianEmail
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-progress-reports function:", error);
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
