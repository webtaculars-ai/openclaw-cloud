import * as cdk from 'aws-cdk-lib';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import { Construct } from 'constructs';

export interface FrontendStackProps extends cdk.StackProps {
  apiUrl: string;
  userPoolId: string;
  userPoolClientId: string;
}

export class FrontendStack extends cdk.Stack {
  public readonly app: amplify.CfnApp;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // Amplify App
    this.app = new amplify.CfnApp(this, 'OpenClawFrontend', {
      name: 'openclaw-cloud-frontend',
      buildSpec: `version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'`,
      environmentVariables: [
        {
          name: 'REACT_APP_API_URL',
          value: props.apiUrl,
        },
        {
          name: 'REACT_APP_USER_POOL_ID',
          value: props.userPoolId,
        },
        {
          name: 'REACT_APP_USER_POOL_CLIENT_ID',
          value: props.userPoolClientId,
        },
        {
          name: 'REACT_APP_AWS_REGION',
          value: cdk.Stack.of(this).region,
        },
      ],
    });

    // Exports
    new cdk.CfnOutput(this, 'AmplifyAppId', {
      value: this.app.attrAppId,
      exportName: 'OpenClawAmplifyAppId',
    });

    new cdk.CfnOutput(this, 'AmplifyAppName', {
      value: this.app.name!,
      exportName: 'OpenClawAmplifyAppName',
    });
  }
}
