import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AgentSetup from './pages/AgentSetup';
import Billing from './pages/Billing';

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
            <Authenticator>
              {({ signOut, user }) => <Dashboard user={user} signOut={signOut} />}
            </Authenticator>
          }
        />
        <Route
          path="/setup"
          element={
            <Authenticator>
              {({ signOut, user }) => <AgentSetup user={user} signOut={signOut} />}
            </Authenticator>
          }
        />
        <Route
          path="/billing"
          element={
            <Authenticator>
              {({ signOut, user }) => <Billing user={user} signOut={signOut} />}
            </Authenticator>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
