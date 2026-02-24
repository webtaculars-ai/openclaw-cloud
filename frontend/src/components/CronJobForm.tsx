import React, { useState } from 'react';
import { Card, Button, Input } from './ui';
import { Sparkles } from 'lucide-react';
import { CreateCronJobRequest, CronSchedule } from '../services/cronApi';

interface Props {
  onSubmit: (data: CreateCronJobRequest) => void;
  onCancel: () => void;
  initialData?: any;
}

interface Template {
  id: string;
  name: string;
  icon: string;
  description: string;
  schedule: any;
  task: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'daily-standup',
    name: 'Daily Standup',
    icon: '📊',
    description: 'Get a morning summary every day at 9 AM',
    schedule: { kind: 'cron', expr: '0 9 * * *', tz: 'UTC' },
    task: 'Give me a brief daily standup: top 3 priorities for today, any blockers, and one motivational quote.',
  },
  {
    id: 'stock-alert',
    name: 'Stock Price Check',
    icon: '📈',
    description: 'Check Bitcoin price every hour',
    schedule: { kind: 'every', everyMs: 3600000 }, // 1 hour
    task: 'Check the current Bitcoin price and alert me if it changes by more than 5% since last check.',
  },
  {
    id: 'weekly-report',
    name: 'Weekly Report',
    icon: '📋',
    description: 'Friday summary at 5 PM',
    schedule: { kind: 'cron', expr: '0 17 * * 5', tz: 'UTC' },
    task: 'Generate a weekly summary: key accomplishments this week, upcoming priorities, and any action items.',
  },
  {
    id: 'news-digest',
    name: 'Morning News',
    icon: '📰',
    description: 'Tech news every morning at 8 AM',
    schedule: { kind: 'cron', expr: '0 8 * * *', tz: 'UTC' },
    task: 'Search for top 3 tech news stories from today and give me a brief summary of each.',
  },
];

const CronJobForm: React.FC<Props> = ({ onSubmit, onCancel, initialData }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [name, setName] = useState(initialData?.name || '');
  const [task, setTask] = useState(initialData?.payload?.message || '');
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly' | 'hourly' | 'custom'>('daily');
  const [dailyTime, setDailyTime] = useState('09:00');
  const [weeklyDay, setWeeklyDay] = useState('1'); // Monday
  const [weeklyTime, setWeeklyTime] = useState('09:00');
  const [hourlyInterval, setHourlyInterval] = useState('1');
  const [customCron, setCustomCron] = useState('');

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template.id);
    setName(template.name);
    setTask(template.task);
    
    // Set schedule based on template
    const { schedule } = template;
    if (schedule.kind === 'cron') {
      if (schedule.expr === '0 9 * * *') {
        setScheduleType('daily');
        setDailyTime('09:00');
      } else if (schedule.expr === '0 17 * * 5') {
        setScheduleType('weekly');
        setWeeklyDay('5');
        setWeeklyTime('17:00');
      } else {
        setScheduleType('custom');
        setCustomCron(schedule.expr);
      }
    } else if (schedule.kind === 'every') {
      setScheduleType('hourly');
      setHourlyInterval(String(schedule.everyMs / 3600000));
    }
  };

  const buildSchedule = (): CronSchedule => {
    switch (scheduleType) {
      case 'daily': {
        const [hour, minute] = dailyTime.split(':');
        return {
          kind: 'cron' as const,
          expr: `${minute} ${hour} * * *`,
          tz: 'UTC',
        };
      }
      case 'weekly': {
        const [hour, minute] = weeklyTime.split(':');
        return {
          kind: 'cron' as const,
          expr: `${minute} ${hour} * * ${weeklyDay}`,
          tz: 'UTC',
        };
      }
      case 'hourly': {
        return {
          kind: 'every' as const,
          everyMs: parseInt(hourlyInterval) * 3600000,
        };
      }
      case 'custom': {
        return {
          kind: 'cron' as const,
          expr: customCron,
          tz: 'UTC',
        };
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobData: CreateCronJobRequest = {
      name,
      schedule: buildSchedule(),
      payload: {
        kind: 'agentTurn',
        message: task,
      },
      sessionTarget: 'isolated',
      enabled: true,
    };

    onSubmit(jobData);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Sparkles className="w-6 h-6 mr-2 text-primary-600" />
        {initialData ? 'Edit Task' : 'Create New Task'}
      </h2>

      {!selectedTemplate && !initialData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Choose a Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all"
              >
                <div className="flex items-start">
                  <span className="text-3xl mr-3">{template.icon}</span>
                  <div>
                    <h4 className="font-bold text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setSelectedTemplate('custom')}
            >
              Start from Scratch
            </Button>
          </div>
        </div>
      )}

      {(selectedTemplate || initialData) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Daily Standup"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What should your AI do?
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Describe the task your AI should perform..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleType('daily')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    scheduleType === 'daily'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType('weekly')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    scheduleType === 'weekly'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType('hourly')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    scheduleType === 'hourly'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Hourly
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType('custom')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    scheduleType === 'custom'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Custom
                </button>
              </div>

              {scheduleType === 'daily' && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Time (UTC)</label>
                  <Input
                    type="time"
                    value={dailyTime}
                    onChange={(e) => setDailyTime(e.target.value)}
                    required
                  />
                </div>
              )}

              {scheduleType === 'weekly' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Day</label>
                    <select
                      value={weeklyDay}
                      onChange={(e) => setWeeklyDay(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                      <option value="0">Sunday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Time (UTC)</label>
                    <Input
                      type="time"
                      value={weeklyTime}
                      onChange={(e) => setWeeklyTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {scheduleType === 'hourly' && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Every</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="24"
                      value={hourlyInterval}
                      onChange={(e) => setHourlyInterval(e.target.value)}
                      required
                    />
                    <span className="text-gray-600">hour(s)</span>
                  </div>
                </div>
              )}

              {scheduleType === 'custom' && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Cron Expression
                  </label>
                  <Input
                    type="text"
                    value={customCron}
                    onChange={(e) => setCustomCron(e.target.value)}
                    placeholder="0 9 * * *"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: minute hour day month weekday
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" size="lg" className="flex-1">
              {initialData ? 'Update Task' : 'Create Task'}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default CronJobForm;
