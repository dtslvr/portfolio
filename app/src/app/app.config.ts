import { InjectionToken } from '@angular/core';

export let APP_CONFIG = new InjectionToken('app.config');

export interface IAppConfig {
  backendUri: string;
  develMode: boolean;
  version: string;
}

export const AppConfig: IAppConfig = {
  backendUri: 'https://a4z09td8id.execute-api.us-east-1.amazonaws.com/dev',
  develMode: true,
  version: '1.6.2'
};
