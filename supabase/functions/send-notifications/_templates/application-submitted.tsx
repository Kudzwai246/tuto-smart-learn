import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ApplicationSubmittedEmailProps {
  recipientName: string;
  applicationId?: string;
  subjects?: string[];
  city?: string;
  experience?: string;
  documentsUploaded?: number;
}

export const ApplicationSubmittedEmail = ({
  recipientName,
  applicationId,
  subjects = [],
  city,
  experience,
  documentsUploaded = 0,
}: ApplicationSubmittedEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Tuto Teacher Application Has Been Received</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={h1}>Tuto</Heading>
          <Text style={tagline}>Quality Education at Affordable Prices</Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h2}>Hello {recipientName},</Heading>

          <Text style={paragraph}>
            Thank you for applying to become a Tuto teacher! Your application has been successfully received and is now under review by our team.
          </Text>

          {/* Application Details Box */}
          <Section style={detailsBox}>
            <Heading style={h3}>Application Details</Heading>
            <Text style={detail}>
              <strong>Review Timeline:</strong> Within 48 Hours
            </Text>
            {applicationId && (
              <Text style={detail}>
                <strong>Reference ID:</strong> TUT-{applicationId.slice(0, 8)}
              </Text>
            )}
            {subjects.length > 0 && (
              <Text style={detail}>
                <strong>Subjects:</strong> {subjects.join(', ')}
              </Text>
            )}
            {city && (
              <Text style={detail}>
                <strong>Location:</strong> {city}
              </Text>
            )}
            {experience && (
              <Text style={detail}>
                <strong>Experience:</strong> {experience} years
              </Text>
            )}
            {documentsUploaded > 0 && (
              <Text style={detail}>
                <strong>Documents:</strong> {documentsUploaded} file(s) uploaded
              </Text>
            )}
          </Section>

          {/* What Happens Next */}
          <Text style={sectionTitle}>What happens next?</Text>
          <ul style={list}>
            <li style={listItem}>Our team will review your qualifications and experience</li>
            <li style={listItem}>We'll verify your teaching credentials and uploaded documents</li>
            <li style={listItem}>You'll receive an email within 48 hours with our decision</li>
            <li style={listItem}>If approved, you'll gain access to your teacher dashboard</li>
          </ul>

          <Hr style={separator} />

          <Text style={helpText}>
            <strong>Need help?</strong> Contact us at{' '}
            <Link href="mailto:support@tuto.co.zw" style={link}>
              support@tuto.co.zw
            </Link>
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Thank you for being part of the Tuto community!
          </Text>
          <Text style={footerSignature}>
            <strong>Kudzwai Madyavanhu</strong>
            <br />
            CEO & Co-Founder, Tuto
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ApplicationSubmittedEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginTop: '40px',
  marginBottom: '40px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const header = {
  backgroundColor: '#1E88E5',
  padding: '30px 40px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 10px',
};

const tagline = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
  opacity: 0.9,
};

const content = {
  padding: '40px',
};

const h2 = {
  color: '#1E88E5',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px',
};

const h3 = {
  color: '#1E88E5',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 15px',
};

const paragraph = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px',
};

const detailsBox = {
  backgroundColor: '#E3F2FD',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const detail = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 8px',
};

const sectionTitle = {
  color: '#1E88E5',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '30px 0 15px',
};

const list = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '24px',
  paddingLeft: '20px',
  margin: '0 0 20px',
};

const listItem = {
  marginBottom: '8px',
};

const separator = {
  borderColor: '#e6e6e6',
  margin: '30px 0',
};

const helpText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const link = {
  color: '#1E88E5',
  textDecoration: 'underline',
};

const footer = {
  backgroundColor: '#1E88E5',
  padding: '30px 40px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0 0 15px',
};

const footerSignature = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
  lineHeight: '22px',
};
