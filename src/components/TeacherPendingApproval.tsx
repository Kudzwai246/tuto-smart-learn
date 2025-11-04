
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, Phone, Mail, FileText } from 'lucide-react';
import TutoLogo from './TutoLogo';

interface TeacherPendingApprovalProps {
  onBackToHome: () => void;
}

const TeacherPendingApproval: React.FC<TeacherPendingApprovalProps> = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <TutoLogo size="lg" className="justify-center mb-6" />
        </div>

        <Card className="shadow-lg border-none">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Application Under Review
            </CardTitle>
            <p className="text-gray-600">
              Thank you for applying to become a Tuto teacher!
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">What's Next?</h3>
              <div className="space-y-3 text-sm text-yellow-700">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p>Our team is reviewing your qualifications and documents</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p>We'll verify your teaching credentials and experience</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p>You'll receive an email with our decision <strong>within 48 hours</strong></p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p>Check your email inbox (and spam folder) for updates</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Review Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Application Submitted</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">Under Review (Current)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-400">Approval & Account Setup</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@tuto.co.zw</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+263 77 123 4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Application Reference: TUT-{Date.now().toString().slice(-6)}</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={onBackToHome}
              variant="outline" 
              className="w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500">
          We appreciate your patience during the review process
        </p>
      </div>
    </div>
  );
};

export default TeacherPendingApproval;
