export default defineNuxtConfig({
  modules: ['@safejace/salesforce'],
  runtimeConfig: {
    public: {
      salesforce: {
        grantType: 'refresh_token',
        accountId: process.env.SALESFORCE_ACCOUNT_ID,
        oauth: {
          clientId: process.env.SALESFORCE_CLIENT_ID,
          clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
          refreshToken: process.env.SALESFORCE_REFRESH_TOKEN,
        },
      },
    },
  },
})
