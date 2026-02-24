import React from 'react';
import Layout from '../components/Layout';

const Terms: React.FC = () => {
  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
          Terms of Service
        </h1>
        
        <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '2rem' }}>
          <strong>Effective Date:</strong> February 20, 2026<br />
          <strong>Last Updated:</strong> February 20, 2026
        </p>

        <div style={{ lineHeight: '1.8', color: '#444' }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>1. Agreement to Terms</h2>
            <p>By accessing or using OpenPaw ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>2. Description of Service</h2>
            <p>OpenPaw provides managed AI agent infrastructure powered by OpenClaw, enabling users to:</p>
            <ul style={{ paddingLeft: '2rem', margin: '1rem 0' }}>
              <li>Deploy personal AI assistants accessible via messaging platforms (Telegram, WhatsApp, Discord)</li>
              <li>Automate web browsing and task completion</li>
              <li>Schedule automated actions and notifications</li>
              <li>Use cutting-edge AI models via AWS Bedrock</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>3. Account Registration</h2>
            <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem' }}>3.1 Eligibility</h3>
            <p>You must be at least 18 years old and capable of forming a binding contract to use this Service.</p>
            
            <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem' }}>3.2 Account Security</h3>
            <p>You are responsible for:</p>
            <ul style={{ paddingLeft: '2rem', margin: '1rem 0' }}>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>4. Payment Terms</h2>
            <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem' }}>4.1 Credits System</h3>
            <p>Service is provided on a prepaid credit basis. Credits are purchased in advance, never expire, and are non-transferable between accounts.</p>
            
            <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem' }}>4.2 Usage Charges</h3>
            <p>Credits are deducted based on actual usage:</p>
            <ul style={{ paddingLeft: '2rem', margin: '1rem 0' }}>
              <li>AI API calls (based on token consumption)</li>
              <li>Browser automation tasks</li>
              <li>Infrastructure resources consumed</li>
            </ul>
            <p>Detailed usage tracking is available in your dashboard.</p>
            
            <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem' }}>4.3 No Refunds</h3>
            <p>Credits are non-refundable except as specified in our <a href="/refund-policy" style={{ color: '#4fc3f7' }}>Refund Policy</a> or as required by law.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>5. Acceptable Use</h2>
            <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem' }}>5.1 Permitted Use</h3>
            <p>You may use the Service for personal productivity, legitimate business automation, research, and educational purposes.</p>
            
            <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem' }}>5.2 Prohibited Activities</h3>
            <p>You may NOT use the Service to:</p>
            <ul style={{ paddingLeft: '2rem', margin: '1rem 0' }}>
              <li>Violate any laws or regulations</li>
              <li>Infringe intellectual property rights</li>
              <li>Distribute malware or malicious code</li>
              <li>Engage in fraudulent activities</li>
              <li>Harass, abuse, or harm others</li>
              <li>Scrape or harvest data without permission</li>
              <li>Bypass rate limits or security measures</li>
              <li>Resell or redistribute the Service</li>
              <li>Generate spam or unsolicited content</li>
              <li>Violate AWS Acceptable Use Policy</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>6. Your Content and Data</h2>
            <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem' }}>6.1 Ownership</h3>
            <p>You retain all rights to content you create or provide through the Service.</p>
            
            <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem' }}>6.2 Privacy</h3>
            <p>Our use of your data is governed by our Privacy Policy, available at <a href="/privacy" style={{ color: '#4fc3f7' }}>openpaw.co/privacy</a></p>
            
            <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem' }}>6.3 Data Retention</h3>
            <ul style={{ paddingLeft: '2rem', margin: '1rem 0' }}>
              <li>Active account data is retained indefinitely</li>
              <li>Deleted account data is purged within 30 days</li>
              <li>Backup data may persist for up to 90 days</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>7. AI Model Usage</h2>
            <p>The Service uses AI models provided by AWS Bedrock (including Claude by Anthropic). AI responses may be inaccurate or incomplete. We do not guarantee specific outcomes, and you are responsible for verifying AI-generated content and ensuring compliance with applicable laws.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>8. Service Availability</h2>
            <p>While we strive for high availability, we do not guarantee uninterrupted service. We may perform scheduled or emergency maintenance that temporarily disrupts service. We reserve the right to modify or discontinue features, update infrastructure, change AI models, and adjust rate limits with reasonable notice when possible.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>9. Limitation of Liability</h2>
            <p style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem' }}>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            </p>
            <p>We are not liable for indirect, incidental, or consequential damages, lost profits or revenue, data loss, service interruptions, AI errors, or actions taken based on AI responses.</p>
            <p style={{ marginTop: '1rem' }}>
              <strong>Our total liability is limited to the amount you paid us in the 3 months preceding the claim, or $100, whichever is greater.</strong>
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>10. Termination</h2>
            <p>You may terminate your account at any time. We may suspend or terminate your account for violations of these Terms, inactivity over 12 months, or as required by law. Upon termination, your access ends immediately, your data will be deleted per our retention policy, and unused credits are forfeited.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>11. Contact Information</h2>
            <p>For questions about these Terms:</p>
            <ul style={{ paddingLeft: '2rem', margin: '1rem 0', listStyle: 'none' }}>
              <li>📧 Email: <a href="mailto:support@openpaw.co" style={{ color: '#4fc3f7' }}>support@openpaw.co</a></li>
              <li>🌐 Website: <a href="https://www.openpaw.co" style={{ color: '#4fc3f7' }}>www.openpaw.co</a></li>
            </ul>
          </section>

          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#f0f7ff', 
            border: '2px solid #4fc3f7', 
            borderRadius: '8px',
            marginTop: '3rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
