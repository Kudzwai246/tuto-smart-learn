import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Shield, MapPin, User, FileText, Eye } from 'lucide-react';
import TutoLogo from './TutoLogo';

interface LegalProps {
  onBack?: () => void;
}

const Legal: React.FC<LegalProps> = ({ onBack }) => {
  const [consentStates, setConsentStates] = useState({
    location: false,
    privacy: false,
    parental: false,
    verification: false
  });

  const updateConsent = (type: keyof typeof consentStates, value: boolean) => {
    setConsentStates(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          )}
          <TutoLogo size="sm" />
          <div></div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Shield className="w-6 h-6 mr-2" />
              Legal & Privacy Information
            </CardTitle>
            <p className="text-gray-600">
              Your privacy and data security are important to us. Please review the following policies and consent forms.
            </p>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="consent" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="consent">Consent Forms</TabsTrigger>
                <TabsTrigger value="policy">Privacy Policy</TabsTrigger>
              </TabsList>

              <TabsContent value="consent" className="space-y-6">
                {/* Location Consent */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <MapPin className="w-5 h-5 mr-2" />
                      Location Consent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="location-consent"
                          checked={consentStates.location}
                          onCheckedChange={(checked) => updateConsent('location', checked as boolean)}
                        />
                        <div className="space-y-2">
                          <label htmlFor="location-consent" className="text-sm font-medium text-blue-800 cursor-pointer">
                            I consent to location data usage
                          </label>
                          <p className="text-sm text-blue-700">
                            I consent to Tuto storing my registered location (latitude/longitude and address) for the purpose of suggesting nearby teachers/lessons. I understand my exact coordinates will not be publicly shared and will only be used to compute distance and show approximate location to other users. I can update or remove this location at any time in Settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy & Data Use Consent */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Eye className="w-5 h-5 mr-2" />
                      Privacy & Data Use Consent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="privacy-consent"
                          checked={consentStates.privacy}
                          onCheckedChange={(checked) => updateConsent('privacy', checked as boolean)}
                        />
                        <div className="space-y-2">
                          <label htmlFor="privacy-consent" className="text-sm font-medium text-green-800 cursor-pointer">
                            I agree to Privacy Policy and Terms of Service
                          </label>
                          <p className="text-sm text-green-700">
                            I agree to Tuto's Privacy Policy and Terms of Service. I consent to Tuto processing my personal data (name, email, phone, location, learning preferences) for account creation, matching with teachers, payments, and platform operations. I understand I may withdraw consent by contacting support@tuto or from Settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parental Consent (for minors) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <User className="w-5 h-5 mr-2" />
                      Parental Consent (For Students Under 18)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="parental-consent"
                          checked={consentStates.parental}
                          onCheckedChange={(checked) => updateConsent('parental', checked as boolean)}
                        />
                        <div className="space-y-2">
                          <label htmlFor="parental-consent" className="text-sm font-medium text-orange-800 cursor-pointer">
                            Parental/Guardian consent provided
                          </label>
                          <p className="text-sm text-orange-700">
                            As the parent/guardian, I give consent for my child to use Tuto. I confirm that I have reviewed the Tuto Privacy Policy and accept the platform terms. I allow Tuto to store my child's information and to contact me regarding their account, lessons and payments.
                          </p>
                          <div className="mt-3 text-xs text-orange-600">
                            <p><strong>Required information:</strong> Parent/Guardian full name, phone, email, and digital signature checkbox.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Teacher Verification Consent */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <FileText className="w-5 h-5 mr-2" />
                      Teacher Verification Consent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="verification-consent"
                          checked={consentStates.verification}
                          onCheckedChange={(checked) => updateConsent('verification', checked as boolean)}
                        />
                        <div className="space-y-2">
                          <label htmlFor="verification-consent" className="text-sm font-medium text-purple-800 cursor-pointer">
                            I consent to qualification verification
                          </label>
                          <p className="text-sm text-purple-700">
                            I agree that Tuto may verify my submitted qualifications and identity documents. I consent to Tuto storing copies of these documents for verification and compliance. I confirm all documentation uploaded is accurate and belong to me. I understand that misrepresentation may lead to permanent account suspension.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center pt-4">
                  <Button 
                    className="w-full max-w-sm"
                    disabled={!Object.values(consentStates).every(Boolean)}
                  >
                    Save Consent Preferences
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="policy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tuto Privacy Policy Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Data We Collect</h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                          <li>• Personal information: name, email, phone, date of birth</li>
                          <li>• Location data: residence/business location (latitude/longitude and address)</li>
                          <li>• Educational data: qualifications, subjects, curriculum preferences</li>
                          <li>• Payment information: subscription details, payment history</li>
                          <li>• Device metadata: browser type, IP address, device information</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">How We Use Your Data</h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                          <li>• Account creation and user authentication</li>
                          <li>• Matching students with appropriate teachers</li>
                          <li>• Processing payments and managing subscriptions</li>
                          <li>• Platform analytics and service improvement</li>
                          <li>• Fraud prevention and legal compliance</li>
                          <li>• Communication about lessons, payments, and platform updates</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Data Retention</h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                          <li>• Account data: retained while account is active</li>
                          <li>• Payment records: kept for 7 years for accounting and legal purposes</li>
                          <li>• Communication logs: retained for 2 years</li>
                          <li>• Location data: deleted upon account closure or opt-out</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Your Rights</h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                          <li>• Access: Request copies of your personal data</li>
                          <li>• Correction: Update or correct inaccurate information</li>
                          <li>• Deletion: Request removal of your data (subject to retention requirements)</li>
                          <li>• Portability: Request your data in a machine-readable format</li>
                          <li>• Contact: support@tuto for all data-related requests</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Data Sharing</h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                          <li>• Service providers: payment processors, hosting services (with appropriate safeguards)</li>
                          <li>• Law enforcement: when required by law or legal process</li>
                          <li>• Business transfers: in case of merger, acquisition, or asset sale</li>
                          <li>• We do NOT sell personal data to third parties for marketing purposes</li>
                        </ul>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-semibold text-red-800 mb-2">Important Notice</h3>
                        <p className="text-sm text-red-700">
                          This is a summary of our privacy practices. The complete Privacy Policy and Terms of Service 
                          contain additional important details. We recommend having a legal professional review these 
                          documents as part of your business setup process.
                        </p>
                      </div>

                      <div className="text-center pt-4">
                        <p className="text-sm text-gray-500">
                          Last updated: August 2025 | Contact: support@tuto | 
                          <Button variant="link" className="p-0 h-auto">
                            Download Full Policy (PDF)
                          </Button>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Developer Credit */}
        <div className="text-center text-xs text-gray-400 mt-8">
          <p>Developed by Lovable.dev | Privacy & Security Focused</p>
        </div>
      </div>
    </div>
  );
};

export default Legal;