import React from 'react';
import Layout from '../components/Layout';

const RefundPolicy: React.FC = () => {
  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
          Refund Policy
        </h1>
        
        <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '2rem' }}>
          <strong>Effective Date:</strong> February 20, 2026<br />
          <strong>Last Updated:</strong> February 20, 2026
        </p>

        <div style={{ lineHeight: '1.8', color: '#444' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
            At OpenPaw, we strive for complete customer satisfaction. This Refund Policy explains when refunds are available and how to request them.
          </p>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>1. Overview</h2>
            <p>OpenPaw operates on a prepaid credit system. Credits are purchased in advance and consumed based on actual usage of AI services, browser automation, and infrastructure resources.</p>
            <p style={{ marginTop: '1rem' }}>Credits are generally non-refundable once purchased, except as outlined in this policy or as required by law.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>2. Full Refund Scenarios (100%)</h2>
            
            <h3 style={{ fontSize: '1.2rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#4fc3f7' }}>
              ✅ Service Failure (Within 14 Days)
            </h3>
            <p>You are eligible for a 100% refund if your agent fails to provision successfully due to issues on our end:</p>
            <ul style={{ paddingLeft: '2rem', margin: '1rem 0' }}>
              <li>Agent provisioning fails repeatedly</li>
              <li>Technical errors prevent agent from starting</li>
              <li>Critical features completely non-functional</li>
              <li>Infrastructure issues prevent service access</li>
            </ul>
            <p><strong>Requirements:</strong> Must be reported within 14 days of purchase with error details.</p>

            <h3 style={{ fontSize: '1.2rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#4fc3f7' }}>
              ✅ Unused Credits (Within 14 Days)
            </h3>
            <p>If you have not used any credits and request cancellation within 14 days of purchase.</p>

            <h3 style={{ fontSize: '1.2rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#4fc3f7' }}>
              ✅ Billing Errors (Anytime)
            </h3>
            <p>If we charged your account in error (duplicate charges, incorrect amounts, charges after account closure, system errors).</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>3. Partial Refund Scenarios</h2>
            
            <h3 style={{ fontSize: '1.2rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#ff9800' }}>
              ⚠️ Technical Issues (Within 14 Days)
            </h3>
            <p>If service issues significantly impact your experience (frequent downtime, major features not working, performance issues), you may receive a refund of remaining unused credits only.</p>

            <h3 style={{ fontSize: '1.2rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#ff9800' }}>
              ⚠️ Service Dissatisfaction (Within 7 Days)
            </h3>
            <p>If you're unsatisfied with the service, unused credits may be refunded (subject to 10% administrative fee) within 7 days of purchase.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>4. No Refund Scenarios</h2>
            
            <div style={{ backgroundColor: '#ffebee', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ffcdd2' }}>
              <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold' }}>❌ Refunds are NOT available for:</p>
              <ul style={{ paddingLeft: '2rem', margin: 0 }}>
                <li>Credits consumed for successful AI interactions</li>
                <li>Browser automation tasks that completed</li>
                <li>After 14-day refund window</li>
                <li>User error or incorrect configuration</li>
                <li>Third-party platform issues (Telegram, WhatsApp, AWS)</li>
                <li>Account terminated for Terms of Service violations</li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>5. Refund Process</h2>
            
            <div style={{ backgroundColor: '#e8f5e9', padding: '1.5rem', borderRadius: '8px', border: '1px solid #4caf50', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 1rem 0' }}>📧 How to Request a Refund</h3>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Step 1:</strong> Email <a href="mailto:support@openpaw.co" style={{ color: '#2e7d32' }}>support@openpaw.co</a></p>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Step 2:</strong> We verify and investigate (within 48 hours)</p>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Step 3:</strong> Receive approval/denial decision</p>
              <p style={{ margin: 0 }}><strong>Step 4:</strong> Refund processed within 5-7 business days</p>
            </div>

            <p><strong>Include in your email:</strong></p>
            <ul style={{ paddingLeft: '2rem', margin: '1rem 0' }}>
              <li>Your account email</li>
              <li>Purchase date and amount</li>
              <li>Reason for refund request</li>
              <li>Screenshots or error messages (if applicable)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>6. Service Outages</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Outage Duration</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Compensation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>&lt; 4 hours</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Service credit may be offered</td>
                </tr>
                <tr style={{ backgroundColor: '#f9f9f9' }}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>&gt; 4 hours in 24h</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Pro-rated credit for downtime</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>&gt; 24 hours</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Pro-rated refund available</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>7. Credit Expiration</h2>
            <div style={{ backgroundColor: '#fff3cd', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ffc107' }}>
              <p style={{ margin: 0 }}><strong>⏰ Credits Never Expire</strong></p>
              <p style={{ margin: '0.5rem 0 0 0' }}>However, inactive accounts (&gt;12 months) may be closed with warnings sent before closure. Unused credits in closed accounts are forfeited.</p>
            </div>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>8. Chargebacks</h2>
            <div style={{ backgroundColor: '#ffebee', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ef5350' }}>
              <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold' }}>⚠️ Before filing a chargeback, please contact us.</p>
              <p style={{ margin: 0 }}>Chargebacks result in immediate account suspension, forfeit of all credits, and may result in permanent ban. We will provide evidence to payment processors to dispute unjustified chargebacks.</p>
            </div>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>9. Summary Table</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0' }}>
              <thead>
                <tr style={{ backgroundColor: '#4fc3f7', color: 'white' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Scenario</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Timeframe</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Refund Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Service failure</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>14 days</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd', color: '#4caf50', fontWeight: 'bold' }}>100%</td>
                </tr>
                <tr style={{ backgroundColor: '#f9f9f9' }}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Never used</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>14 days</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd', color: '#4caf50', fontWeight: 'bold' }}>100%</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Billing error</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Anytime</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd', color: '#4caf50', fontWeight: 'bold' }}>100%</td>
                </tr>
                <tr style={{ backgroundColor: '#f9f9f9' }}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Technical issues</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>14 days</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd', color: '#ff9800' }}>Unused credits</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Dissatisfied</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>7 days</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd', color: '#ff9800' }}>Unused - 10%</td>
                </tr>
                <tr style={{ backgroundColor: '#f9f9f9' }}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>After using</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>N/A</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd', color: '#f44336', fontWeight: 'bold' }}>None</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>10. Contact Us</h2>
            <p>For refund requests or questions:</p>
            <div style={{ backgroundColor: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', margin: '1rem 0' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>📧 <strong>Email:</strong> <a href="mailto:support@openpaw.co" style={{ color: '#4fc3f7' }}>support@openpaw.co</a></p>
              <p style={{ margin: '0 0 0.5rem 0' }}>🌐 <strong>Website:</strong> <a href="https://www.openpaw.co" style={{ color: '#4fc3f7' }}>www.openpaw.co</a></p>
              <p style={{ margin: 0 }}>⏱️ <strong>Response Time:</strong> Within 48 business hours</p>
            </div>
          </section>

          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#e8f5e9', 
            border: '2px solid #4caf50', 
            borderRadius: '8px',
            marginTop: '3rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>
              <strong>We're committed to fair treatment and customer satisfaction.</strong><br />
              If you have any questions or concerns, please don't hesitate to reach out.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPolicy;
