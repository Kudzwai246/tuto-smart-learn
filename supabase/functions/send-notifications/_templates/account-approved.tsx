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
  Button,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface AccountApprovedEmailProps {
  recipientName: string;
  recipientEmail: string;
  subjects?: string[];
  city?: string;
  experience?: string;
}

export const AccountApprovedEmail = ({
  recipientName,
  recipientEmail,
  subjects = [],
  city,
  experience,
}: AccountApprovedEmailProps) => (
  <Html>
    <Head />
    <Preview>🎉 Welcome Aboard! Your Tuto Teacher Account is Approved</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={h1}>🎉 Congratulations!</Heading>
          <Text style={tagline}>You're officially a Tuto Teacher</Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h2}>Welcome to Tuto, {recipientName}!</Heading>

          <Text style={paragraph}>
            We're thrilled to inform you that your teacher application has been approved! You're now part of the Tuto community and can start connecting with students.
          </Text>

          {/* Credentials Box */}
          <Section style={credentialsBox}>
            <Heading style={h3}>Your Teacher Credentials</Heading>
            <Text style={detail}>
              <strong>Name:</strong> {recipientName}
            </Text>
            <Text style={detail}>
              <strong>Email (Username):</strong> {recipientEmail}
            </Text>
            <Text style={detail}>
              <strong>Status:</strong> <span style={activeStatus}>Active</span>
            </Text>
          </Section>

          {/* What You Can Do Now */}
          <Text style={sectionTitle}>You can now:</Text>
          <ul style={list}>
            <li style={listItem}>✓ Access your teacher dashboard</li>
            <li style={listItem}>✓ Be discovered by students searching for teachers</li>
            <li style={listItem}>✓ Receive subscription requests from students</li>
            <li style={listItem}>✓ Start earning 90% of lesson fees</li>
            <li style={listItem}>✓ Upload educational content to Tuto Library</li>
          </ul>

          {/* Profile Info */}
          {(subjects.length > 0 || city || experience) && (
            <>
              <Text style={sectionTitle}>Students can now find you based on:</Text>
              <Section style={profileBox}>
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
              </Section>
            </>
          )}

          {/* Next Steps */}
          <Text style={sectionTitle}>Next Steps:</Text>
          <ol style={list}>
            <li style={listItem}>Log in to your teacher dashboard</li>
            <li style={listItem}>Complete your profile (add photo, teaching methodology)</li>
            <li style={listItem}>Set your pricing and availability</li>
            <li style={listItem}>Start accepting students!</li>
          </ol>

          <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
            <Button
              href="https://tuto.co.zw"
              style={ctaButton}
            >
              Go to Dashboard
            </Button>
          </Section>

          <Hr style={separator} />

          <Text style={helpText}>
            <strong>Need help getting started?</strong> Contact us at{' '}
            <Link href="mailto:support@tuto.co.zw" style={link}>
              support@tuto.co.zw
            </Link>
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            We're excited to have you as part of the Tuto teaching community!
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

export default AccountApprovedEmail;

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
  background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
  padding: '40px',
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
  fontSize: '16px',
  margin: '0',
  opacity: 0.95,
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

const credentialsBox = {
  backgroundColor: '#E8F5E8',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
  border: '2px solid #4CAF50',
};

const profileBox = {
  backgroundColor: '#E3F2FD',
  borderRadius: '8px',
  padding: '15px 20px',
  margin: '15px 0 20px',
};

const detail = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 8px',
};

const activeStatus = {
  color: '#4CAF50',
  fontWeight: 'bold' as const,
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

const ctaButton = {
  backgroundColor: '#1E88E5',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
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
  background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
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
