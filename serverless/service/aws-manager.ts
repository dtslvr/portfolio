import AWS = require('aws-sdk');
import { config } from '../config/config';

class AwsManager {
  private s3;

  constructor() {
    (<any>AWS.config).update({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region
    });

    this.s3 = new AWS.S3();
  }

  public getConfig() {
    return AWS.config;
  }

  public getS3() {
    return this.s3;
  }
}

export const awsManager = new AwsManager();
