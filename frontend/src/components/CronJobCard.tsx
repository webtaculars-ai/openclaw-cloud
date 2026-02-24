import React from 'react';
import { Calendar, Clock, Play, Edit, Power, Trash2, BarChart } from 'lucide-react';
import { Card, Button, Badge } from './ui';
import { CronJob } from '../services/cronApi';

interface Props {
  job: CronJob;
  onEdit: () => void;
  onDelete: () => void;
  onRunNow: () => void;
  onToggle: () => void;
}

const CronJobCard: React.FC<Props> = ({ job, onEdit, onDelete, onRunNow, onToggle }) => {
  const getScheduleText = () => {
    const { schedule } = job;
    
    if (schedule.kind === 'at') {
      const date = new Date(schedule.at);
      return `Once at ${date.toLocaleString()}`;
    }
    
    if (schedule.kind === 'every') {
      const hours = Math.floor(schedule.everyMs / (1000 * 60 * 60));
      const minutes = Math.floor((schedule.everyMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        return `Every ${days} day${days > 1 ? 's' : ''}`;
      }
      if (hours > 0) {
        return `Every ${hours} hour${hours > 1 ? 's' : ''}`;
      }
      return `Every ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    if (schedule.kind === 'cron') {
      // Parse common cron patterns
      const expr = schedule.expr;
      if (expr === '0 9 * * *') return 'Every day at 9:00 AM';
      if (expr === '0 17 * * 5') return 'Every Friday at 5:00 PM';
      if (expr === '0 * * * *') return 'Every hour';
      return `Cron: ${expr}`;
    }
    
    return 'Custom schedule';
  };

  const getLastRunText = () => {
    if (!job.lastRun) return 'Never run';
    
    const lastRun = new Date(job.lastRun.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - lastRun.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getStatusBadge = () => {
    if (!job.enabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    
    if (job.lastRun?.status === 'success') {
      return <Badge variant="success">Active</Badge>;
    }
    
    if (job.lastRun?.status === 'failed') {
      return <Badge variant="danger">Failed</Badge>;
    }
    
    return <Badge variant="primary">Active</Badge>;
  };

  const getIcon = () => {
    const name = job.name?.toLowerCase() || '';
    
    if (name.includes('standup') || name.includes('daily')) {
      return '📊';
    }
    if (name.includes('stock') || name.includes('bitcoin') || name.includes('price')) {
      return '📈';
    }
    if (name.includes('report') || name.includes('summary')) {
      return '📋';
    }
    if (name.includes('reminder')) {
      return '⏰';
    }
    if (name.includes('news')) {
      return '📰';
    }
    return '⚡';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{getIcon()}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {job.name || 'Unnamed Task'}
              </h3>
              {getStatusBadge()}
            </div>
          </div>
          
          <div className="ml-11 space-y-2">
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>{getScheduleText()}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <BarChart className="w-4 h-4 mr-2" />
              <span>Last run: {getLastRunText()}</span>
            </div>
            
            {job.payload.kind === 'agentTurn' && (
              <div className="text-sm text-gray-500 mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                <strong>Task:</strong> {job.payload.message}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            icon={<Edit className="w-4 h-4" />}
          >
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRunNow}
            icon={<Play className="w-4 h-4" />}
          >
            Run Now
          </Button>
          
          <Button
            variant={job.enabled ? 'secondary' : 'success'}
            size="sm"
            onClick={onToggle}
            icon={<Power className="w-4 h-4" />}
          >
            {job.enabled ? 'Disable' : 'Enable'}
          </Button>
          
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
            icon={<Trash2 className="w-4 h-4" />}
          />
        </div>
      </div>
    </Card>
  );
};

export default CronJobCard;
