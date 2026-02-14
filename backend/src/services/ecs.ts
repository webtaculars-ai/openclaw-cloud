import { ECSClient, RunTaskCommand, StopTaskCommand, DescribeTasksCommand } from '@aws-sdk/client-ecs';

const client = new ECSClient({});

const ECS_CLUSTER = process.env.ECS_CLUSTER!;
const TASK_DEFINITION = process.env.TASK_DEFINITION!;
const VPC_SUBNETS = process.env.VPC_SUBNETS!.split(',');
const SECURITY_GROUP = process.env.SECURITY_GROUP!;

export interface RunAgentParams {
  agentId: string;
  userId: string;
  telegramBotToken: string;
  model: string;
}

export async function runAgentTask(params: RunAgentParams): Promise<string> {
  const command = new RunTaskCommand({
    cluster: ECS_CLUSTER,
    taskDefinition: TASK_DEFINITION,
    launchType: 'FARGATE',
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: VPC_SUBNETS,
        assignPublicIp: 'ENABLED',
        securityGroups: [SECURITY_GROUP],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: 'agent',
          environment: [
            { name: 'AGENT_ID', value: params.agentId },
            { name: 'USER_ID', value: params.userId },
            { name: 'TELEGRAM_BOT_TOKEN', value: params.telegramBotToken },
            { name: 'MODEL', value: params.model },
          ],
        },
      ],
    },
  });

  const result = await client.send(command);
  
  if (!result.tasks || result.tasks.length === 0 || !result.tasks[0].taskArn) {
    throw new Error('Failed to start ECS task');
  }

  return result.tasks[0].taskArn;
}

export async function stopAgentTask(taskArn: string): Promise<void> {
  await client.send(new StopTaskCommand({
    cluster: ECS_CLUSTER,
    task: taskArn,
    reason: 'User requested stop',
  }));
}

export async function describeTask(taskArn: string): Promise<string> {
  const result = await client.send(new DescribeTasksCommand({
    cluster: ECS_CLUSTER,
    tasks: [taskArn],
  }));

  if (!result.tasks || result.tasks.length === 0) {
    return 'UNKNOWN';
  }

  return result.tasks[0].lastStatus || 'UNKNOWN';
}
