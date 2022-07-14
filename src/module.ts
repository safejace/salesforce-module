import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineNuxtModule, addPlugin } from '@nuxt/kit';
import { AuthInfo, Connection } from '@salesforce/core';
import { QueryResult } from 'jsforce';

export interface ModuleOptions {
  addPlugin: boolean;
  loginUrl?: string;
  authCode: string;
  clientId: string;
  clientSecret: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'salesforce-module',
    configKey: 'salesforce',
  },
  defaults: {
    addPlugin: true,
    loginUrl: '',
    authCode: '',
    clientId: '',
    clientSecret: '',
  },
  setup(options, nuxt) {
    const accessToken =
      '00D8L0000008aJx!AQgAQEUQxBrSx.v7j4TzO0OOgoKdEhYdCooRCwNARG6Ks2pljdPq5wqPojHs2M8CGurUOhBqHP1lljaUiv6XTtSMK8moZQys';
    const loginUrl = options.loginUrl;
    const authCode = options.authCode;
    const clientId = options.clientId;
    const clientSecret = options.clientSecret;
    if (options.addPlugin) {
      const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url));
      nuxt.options.build.transpile.push(runtimeDir, '@nuxtjs/salesforce');
      addPlugin(resolve(runtimeDir, 'plugin'));
    }

    nuxt.hook('listen', async () => {
      const connection: Connection = await Connection.create({
        authInfo: await AuthInfo.create({
          username: accessToken,
          oauth2Options: {
            loginUrl,
            authCode,
            clientId,
            clientSecret,
          },
        }),
      });
      connection.instanceUrl = loginUrl;
      connection.refreshToken = authCode;
      const result: QueryResult<{}> = await connection.query(
        "SELECT Id, Name, Webinar_Date__c, WebinarTimezone__c, Webinar_Description__c, WebinarLanguage__c, Webinar_Registration_Link__c, Training_Provider_Name__c, Training_Provider_URL__c FROM VAR_Event__c WHERE RecordType.Name = 'FME Accelerator' AND Safe_Approved__c = true"
      );
      console.log(result);
    });
  },
});
