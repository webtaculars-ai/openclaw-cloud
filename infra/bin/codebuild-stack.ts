#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'OpenPawImageBuildStack', {
  env: {
    account: '851725418250',
    region: 'ap-south-1'
  }
});

// Use existing ECR repo
const repository = ecr.Repository.fromRepositoryName(
  stack,
  'OpenPawAgentRepo',
  'openpaw-agent'
);

// Create CodeBuild project
const project = new codebuild.Project(stack, 'OpenPawAgentBuild', {
  projectName: 'openpaw-agent-build',
  description: 'Build OpenPaw agent Docker image',
  
  buildSpec: codebuild.BuildSpec.fromObject({
    version: '0.2',
    phases: {
      pre_build: {
        commands: [
          'echo Logging in to Amazon ECR...',
          'aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 851725418250.dkr.ecr.ap-south-1.amazonaws.com',
          'REPOSITORY_URI=851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent',
          'IMAGE_TAG=latest'
        ]
      },
      build: {
        commands: [
          'echo Build started on `date`',
          'echo Building the Docker image...',
          'docker build -t openpaw-agent:latest .',
          'docker tag openpaw-agent:latest $REPOSITORY_URI:$IMAGE_TAG'
        ]
      },
      post_build: {
        commands: [
          'echo Build completed on `date`',
          'echo Pushing the Docker image...',
          'docker push $REPOSITORY_URI:$IMAGE_TAG'
        ]
      }
    }
  }),
  
  environment: {
    buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
    privileged: true // Required for Docker
  },
  
  // Use inline source - we'll provide the files
  source: codebuild.Source.gitHub({
    owner: 'your-github',
    repo: 'openclaw-cloud',
    webhook: false
  })
});

// Grant ECR push permissions
repository.grantPullPush(project);

app.synth();
