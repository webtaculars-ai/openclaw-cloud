#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'OpenPawImageBuildStack', {
  env: {
    account: '851725418250',
    region: 'ap-south-1'
  },
  description: 'CodeBuild infrastructure for building OpenPaw agent Docker images'
});

// Import existing ECR repository
const repository = ecr.Repository.fromRepositoryName(
  stack,
  'OpenPawAgentRepo',
  'openpaw-agent'
);

// Create S3 bucket for build artifacts (Dockerfile, entrypoint.sh)
const buildAssetsBucket = new s3.Bucket(stack, 'BuildAssetsBucket', {
  bucketName: 'openpaw-build-assets-851725418250',
  removalPolicy: cdk.RemovalPolicy.RETAIN,
  autoDeleteObjects: false,
  versioned: false,
  publicReadAccess: false,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  encryption: s3.BucketEncryption.S3_MANAGED
});

// Upload Dockerfile and entrypoint.sh to S3
new s3deploy.BucketDeployment(stack, 'DeployBuildAssets', {
  sources: [s3deploy.Source.asset('../docker')],
  destinationBucket: buildAssetsBucket,
  destinationKeyPrefix: 'docker/',
});

// Create CodeBuild project
const project = new codebuild.Project(stack, 'OpenPawAgentBuild', {
  projectName: 'openpaw-agent-build',
  description: 'Build OpenPaw agent Docker image with OpenClaw pre-installed',
  
  source: codebuild.Source.s3({
    bucket: buildAssetsBucket,
    path: 'docker/'
  }),
  
  buildSpec: codebuild.BuildSpec.fromObject({
    version: '0.2',
    phases: {
      pre_build: {
        commands: [
          'echo Logging in to Amazon ECR...',
          'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com',
          'REPOSITORY_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME',
          'IMAGE_TAG=${IMAGE_TAG:-latest}',
          'echo "Building image: $REPOSITORY_URI:$IMAGE_TAG"'
        ]
      },
      build: {
        commands: [
          'echo Build started on $(date)',
          'echo Building Docker image...',
          'docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG .',
          'docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $REPOSITORY_URI:$IMAGE_TAG'
        ]
      },
      post_build: {
        commands: [
          'echo Build completed on $(date)',
          'echo Pushing Docker image to ECR...',
          'docker push $REPOSITORY_URI:$IMAGE_TAG',
          'echo Image pushed successfully',
          'echo Writing image URI to file...',
          'echo $REPOSITORY_URI:$IMAGE_TAG > image-uri.txt'
        ]
      }
    },
    artifacts: {
      files: ['image-uri.txt']
    }
  }),
  
  environment: {
    buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
    privileged: true, // Required for Docker builds
    computeType: codebuild.ComputeType.SMALL,
    environmentVariables: {
      'AWS_DEFAULT_REGION': {
        value: 'ap-south-1'
      },
      'AWS_ACCOUNT_ID': {
        value: '851725418250'
      },
      'IMAGE_REPO_NAME': {
        value: 'openpaw-agent'
      }
    }
  },
  
  artifacts: codebuild.Artifacts.s3({
    bucket: buildAssetsBucket,
    path: 'artifacts/',
    name: 'image-info'
  }),
  
  timeout: cdk.Duration.minutes(15),
  
  cache: codebuild.Cache.local(
    codebuild.LocalCacheMode.DOCKER_LAYER,
    codebuild.LocalCacheMode.SOURCE
  )
});

// Grant ECR permissions
repository.grantPullPush(project);

// Grant S3 permissions
buildAssetsBucket.grantRead(project);
buildAssetsBucket.grantWrite(project);

// Output important values
new cdk.CfnOutput(stack, 'CodeBuildProjectName', {
  value: project.projectName,
  description: 'CodeBuild project name'
});

new cdk.CfnOutput(stack, 'ECRRepositoryUri', {
  value: repository.repositoryUri,
  description: 'ECR repository URI'
});

new cdk.CfnOutput(stack, 'BuildAssetsBucketName', {
  value: buildAssetsBucket.bucketName,
  description: 'S3 bucket for build assets'
});

app.synth();
