import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;
  public readonly ecsSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC with 2 AZs, public subnets only (no NAT gateways for cost savings)
    this.vpc = new ec2.Vpc(this, 'OpenClawVPC', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    // Security group for ECS tasks
    this.ecsSecurityGroup = new ec2.SecurityGroup(this, 'ECSSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for OpenClaw agent ECS tasks',
      allowAllOutbound: true,
    });

    // Exports
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      exportName: 'OpenClawVpcId',
    });

    new cdk.CfnOutput(this, 'SecurityGroupId', {
      value: this.ecsSecurityGroup.securityGroupId,
      exportName: 'OpenClawSecurityGroupId',
    });
  }
}
