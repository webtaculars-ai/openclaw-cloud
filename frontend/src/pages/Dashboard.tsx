import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, XCircle, Plus, Zap, CreditCard } from 'lucide-react';
import Layout from '../components/Layout';
import AgentStatusCard from '../components/AgentStatusCard';
import CreditMeter from '../components/CreditMeter';
import { Button, Card } from '../components/ui';
import * as api from '../services/api';

const DemoBanner: React.FC = () => (
  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3 animate-slide-down">
    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-yellow-800 font-medium">Demo Mode</p>
      <p className="text-yellow-700 text-sm">
        This is a preview with mock data. Deploy the backend to enable real functionality.
      </p>
    </div>
  </div>
);

interface AlertProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const styles = type === 'success' 
    ? 'bg-green-50 border-green-200 text-green-800'
    : 'bg-red-50 border-red-200 text-red-800';
  
  const Icon = type === 'success' ? CheckCircle : XCircle;
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`mb-6 p-4 border rounded-lg flex items-start justify-between ${styles} animate-slide-down`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
        <span className="font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Close"
      >
        <XCircle className="w-5 h-5" />
      </button>
    </div>
  );
};

interface Props {
  user: any;
  signOut?: () => void;
}

const Dashboard: React.FC<Props> = ({ user, signOut }) => {
  const [searchParams] = useSearchParams();
  const [agents, setAgents] = useState<api.Agent[]>([]);
  const [credits, setCredits] = useState<api.Credits | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [agentData, creditData] = await Promise.all([
        api.listAgents(),
        api.getCredits(),
      ]);
      setAgents(agentData.agents);
      setCredits(creditData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check for payment success
    if (searchParams.get('payment') === 'success') {
      setSuccessMessage('Payment successful! Your credits have been added.');
    }
  }, [searchParams]);

  // Auto-refresh when agent is running
  useEffect(() => {
    const hasRunningAgent = agents.some(a => a.status === 'running');
    if (!hasRunningAgent) return;

    const interval = setInterval(fetchData, 30_000); // 30s
    return () => clearInterval(interval);
  }, [agents]);

  const handleStart = async (agentId: string) => {
    setActionLoading(true);
    try {
      await api.startAgent(agentId);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async (agentId: string) => {
    setActionLoading(true);
    try {
      await api.stopAgent(agentId);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout userEmail={user?.signInDetails?.loginId} onSignOut={signOut}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-500 mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const agent = agents[0]; // MVP: single agent
  const hasAgent = !!agent;
  const hasCredits = credits && credits.balance > 0;

  return (
    <Layout userEmail={user?.signInDetails?.loginId} onSignOut={signOut}>
      {api.isMockMode() && <DemoBanner />}
      
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your OpenPaw agent and monitor usage</p>
      </div>

      {credits && (
        <div className="mb-8 animate-slide-up">
          <CreditMeter
            balanceCents={credits.balance}
            totalUsedCents={credits.totalUsed}
          />
        </div>
      )}

      {hasAgent ? (
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <AgentStatusCard
            agent={agent}
            onStart={() => handleStart(agent.agentId)}
            onStop={() => handleStop(agent.agentId)}
            loading={actionLoading}
          />
        </div>
      ) : (
        <Card className="text-center py-12 animate-scale-in">
          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 mb-6">
              <Zap className="w-10 h-10 text-primary-600" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3">Welcome to OpenPaw Cloud!</h2>
            
            {hasCredits ? (
              <>
                <p className="text-gray-600 mb-6">
                  You're all set with credits! Let's create your AI agent.
                </p>
                <Link to="/setup">
                  <Button 
                    variant="primary" 
                    size="lg"
                    icon={<Plus className="w-5 h-5" />}
                  >
                    Set Up Agent
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  To get started, you'll need to purchase credits first.
                </p>
                <Link to="/billing">
                  <Button 
                    variant="success" 
                    size="lg"
                    icon={<CreditCard className="w-5 h-5" />}
                  >
                    Purchase Credits
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Card>
      )}
    </Layout>
  );
};

export default Dashboard;
