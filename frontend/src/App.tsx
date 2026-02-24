import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AgentSetup from './pages/AgentSetup';
import Billing from './pages/Billing';
import CronJobs from './pages/CronJobs';
import Terms from './pages/Terms';
import RefundPolicy from './pages/RefundPolicy';

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || '',
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={
            <Authenticator
              loginMechanisms={['email']}
              formFields={{
                signUp: {
                  email: {
                    label: 'Email',
                    placeholder: 'Enter your email',
                    order: 1
                  },
                  password: {
                    label: 'Password',
                    placeholder: 'Enter your password',
                    order: 2
                  },
                  confirm_password: {
                    label: 'Confirm Password',
                    order: 3
                  }
                }
              }}
            >
              {({ signOut, user }) => <Dashboard user={user} signOut={signOut} />}
            </Authenticator>
          }
        />
        <Route
          path="/setup"
          element={
            <Authenticator
              loginMechanisms={['email']}
            >
              {({ signOut, user }) => <AgentSetup user={user} signOut={signOut} />}
            </Authenticator>
          }
        />
        <Route
          path="/billing"
          element={
            <Authenticator
              loginMechanisms={['email']}
            >
              {({ signOut, user }) => <Billing user={user} signOut={signOut} />}
            </Authenticator>
          }
        />
        <Route
          path="/cron"
          element={
            <Authenticator
              loginMechanisms={['email']}
            >
              {({ signOut, user }) => <CronJobs user={user} signOut={signOut} />}
            </Authenticator>
          }
        />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
