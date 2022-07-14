import { defineNuxtConfig } from 'nuxt'
import Salesforce from '..'

export default defineNuxtConfig({
  modules: [
    Salesforce
  ],
  salesforce: {
    addPlugin: true,
    loginUrl: process.env.SALESFORCE_ENDPOINT,
    authCode: process.env.SALESFORCE_REFRESH_TOKEN,
    clientId: process.env.SALESFORCE_CLIENT_ID,
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET
  }
})
