import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../components/Layout';
import CronJobCard from '../components/CronJobCard';
import CronJobForm from '../components/CronJobForm';
import { Button, Card } from '../components/ui';
import * as cronApi from '../services/cronApi';

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

const CronJobs: React.FC<Props> = ({ user, signOut }) => {
  const [jobs, setJobs] = useState<cronApi.CronJob[]>([]);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<cronApi.CronJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchJobs = async () => {
    if (!agentId) return;
    
    try {
      const data = await cronApi.listCronJobs(agentId);
      setJobs(data.jobs || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch cron jobs:', err);
      setError(err.message || 'Failed to load scheduled tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get first agent ID (MVP: single agent support)
    const fetchAgentId = async () => {
      try {
        const apiModule = await import('../services/api');
        const data = await apiModule.listAgents();
        if (data.agents && data.agents.length > 0) {
          setAgentId(data.agents[0].agentId);
        } else {
          setError('No agents found. Please create an agent first.');
        }
      } catch (err: any) {
        console.error('Failed to fetch agent:', err);
        setError('Failed to load agent. Please try refreshing the page.');
      }
    };

    fetchAgentId();
  }, []);

  useEffect(() => {
    if (agentId) {
      fetchJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const handleCreateJob = async (jobData: cronApi.CreateCronJobRequest) => {
    if (!agentId) return;

    try {
      await cronApi.createCronJob(agentId, jobData);
      setSuccessMessage('Task scheduled successfully! 🎉');
      setShowForm(false);
      setEditingJob(null);
      await fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    }
  };

  const handleUpdateJob = async (jobId: string, updates: Partial<cronApi.CronJob>) => {
    if (!agentId) return;

    try {
      await cronApi.updateCronJob(agentId, jobId, updates);
      setSuccessMessage('Task updated successfully!');
      setEditingJob(null);
      await fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!agentId || !window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await cronApi.deleteCronJob(agentId, jobId);
      setSuccessMessage('Task deleted successfully');
      await fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleRunNow = async (jobId: string) => {
    if (!agentId) return;

    try {
      await cronApi.runCronJob(agentId, jobId);
      setSuccessMessage('Task triggered! Check your chat for results.');
    } catch (err: any) {
      setError(err.message || 'Failed to run task');
    }
  };

  const handleToggleEnabled = async (jobId: string, enabled: boolean) => {
    await handleUpdateJob(jobId, { enabled: !enabled });
  };

  if (loading) {
    return (
      <Layout userEmail={user?.signInDetails?.loginId} onSignOut={signOut}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-500 mb-4"></div>
            <p className="text-gray-600">Loading scheduled tasks...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userEmail={user?.signInDetails?.loginId} onSignOut={signOut}>
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

      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <Calendar className="w-10 h-10 mr-3 text-primary-600" />
            Scheduled Tasks
          </h1>
          <p className="text-gray-600">Automate your AI friend to work on a schedule</p>
        </div>
        
        <Button
          variant="primary"
          size="lg"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => setShowForm(true)}
        >
          New Task
        </Button>
      </div>

      {showForm && (
        <div className="mb-8 animate-slide-down">
          <CronJobForm
            onSubmit={handleCreateJob}
            onCancel={() => {
              setShowForm(false);
              setEditingJob(null);
            }}
            initialData={editingJob || undefined}
          />
        </div>
      )}

      {jobs.length === 0 ? (
        <Card className="text-center py-16 animate-scale-in">
          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-6">
              <Clock className="w-10 h-10 text-purple-600" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3">No Scheduled Tasks Yet</h2>
            <p className="text-gray-600 mb-6">
              Set up your first automated task! Your AI friend can check stocks, send daily reminders, generate reports, and more—all on autopilot.
            </p>
            
            <Button
              variant="primary"
              size="lg"
              icon={<Plus className="w-5 h-5" />}
              onClick={() => setShowForm(true)}
            >
              Create Your First Task
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <div
              key={job.jobId}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CronJobCard
                job={job}
                onEdit={() => {
                  setEditingJob(job);
                  setShowForm(true);
                }}
                onDelete={() => handleDeleteJob(job.jobId)}
                onRunNow={() => handleRunNow(job.jobId)}
                onToggle={() => handleToggleEnabled(job.jobId, job.enabled)}
              />
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

// Helper function for auth headers (reused from api.ts)
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    
    return {
      'Content-Type': 'application/json',
      ...(idToken && { Authorization: `Bearer ${idToken}` }),
    };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
}

export default CronJobs;
