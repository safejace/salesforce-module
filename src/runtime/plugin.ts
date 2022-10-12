import type { SalesforceHelper } from './composables'
import { defineNuxtPlugin, useSalesforce } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('salesforce', useSalesforce())
})

interface PluginInjection {
  $salesforce: SalesforceHelper
}

declare module '#app' {
  interface NuxtApp extends PluginInjection { }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends PluginInjection { }
}

// @ts-ignore
declare module 'vue/types/vue' {
  interface Vue extends PluginInjection { }
}
