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

interface AccountRejectedEmailProps {
  recipientName: string;
  rejectionReason?: string;
}

export const AccountRejectedEmail = ({
  recipientName,
  rejectionReason = 'Please contact us for more details.',
}: AccountRejectedEmailProps) => (
  <Html>
    <Head />
    <Preview>Tuto Teacher Application Status Update</Preview>
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
            Thank you for your interest in becoming a Tuto teacher and taking the time to submit your application.
          </Text>

          <Text style={paragraph}>
            After careful review of your application, we're unable to approve it at this time.
          </Text>

          {/* Reason Box */}
          <Section style={reasonBox}>
            <Heading style={h3}>Application Status</Heading>
            <Text style={detail}>
              <strong>Status:</strong> <span style={rejectedStatus}>Not Approved</span>
            </Text>
            <Hr style={miniSeparator} />
            <Text style={detail}>
              <strong>Reason:</strong>
            </Text>
            <Text style={reasonText}>
              {rejectionReason}
            </Text>
          </Section>

          {/* Next Steps */}
          <Text style={sectionTitle}>What you can do next:</Text>
          <ul style={list}>
            <li style={listItem}>Review our teacher requirements and qualifications</li>
            <li style={listItem}>Update your qualifications or gain additional teaching experience</li>
            <li style={listItem}>Ensure all documents are clear and valid</li>
            <li style={listItem}>Reapply after addressing the feedback</li>
          </ul>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Important:</strong> You may reapply at any time after addressing the concerns mentioned above. We encourage qualified teachers to resubmit their applications.
            </Text>
          </Section>

          <Hr style={separator} />

          <Text style={helpText}>
            <strong>Questions or need clarification?</strong> Contact us at{' '}
            <Link href="mailto:support@tuto.co.zw" style={link}>
              support@tuto.co.zw
            </Link>
            {' '}and we'll be happy to provide more detailed feedback.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            We appreciate your interest in Tuto and wish you success in your teaching career.
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

export default AccountRejectedEmail;

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
  color: '#666666',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 15px',
};

const paragraph = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px',
};

const reasonBox = {
  backgroundColor: '#FFF3E0',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
  border: '2px solid #FF9800',
};

const detail = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 8px',
};

const rejectedStatus = {
  color: '#F44336',
  fontWeight: 'bold' as const,
};

const miniSeparator = {
  borderColor: '#e6e6e6',
  margin: '15px 0',
};

const reasonText = {
  color: '#555555',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '10px 0 0',
  padding: '10px',
  backgroundColor: '#ffffff',
  borderRadius: '4px',
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

const infoBox = {
  backgroundColor: '#E3F2FD',
  borderRadius: '8px',
  padding: '15px 20px',
  margin: '20px 0',
};

const infoText = {
  color: '#1565C0',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
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
  backgroundColor: '#f6f6f6',
  padding: '30px 40px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e6e6e6',
};

const footerText = {
  color: '#666666',
  fontSize: '14px',
  margin: '0 0 15px',
};

const footerSignature = {
  color: '#333333',
  fontSize: '14px',
  margin: '0',
  lineHeight: '22px',
};
