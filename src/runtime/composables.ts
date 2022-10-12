import { defu } from 'defu'
import { objectHash } from 'ohash'

import type { SalesforceClient, SalesforceConfiguration } from './client'
import { createClient, checkRefreshToken } from './client'
import {
  useNuxtApp,
  useRuntimeConfig,
  AsyncDataOptions,
  useAsyncData,
  useLazyAsyncData,
} from '#imports'

export interface SalesforceHelper {
  client: SalesforceClient
  config: SalesforceConfiguration
  fetch: SalesforceClient['fetch']
  setToken: (token: string) => void
  fetchRefreshToken: () => Promise<string>
}

const createSalesforceHelper = (
  options: SalesforceConfiguration,
): SalesforceHelper => {
  const config = options
  let client = createClient(config)

  return {
    client,
    config,
    fetch: (...args) => client.fetch(...args),
    setToken (accessToken) {
      config.accessToken = accessToken
      client = createClient(config)
    },
    async fetchRefreshToken () {
      return await checkRefreshToken(config)
    },
  }
}

export const useSalesforce = (): SalesforceHelper => {
  const nuxtApp = useNuxtApp()
  if (nuxtApp._salesforce?.default) {
    return nuxtApp._salesforce.default
  }

  nuxtApp._salesforce = nuxtApp._salesforce || {}

  const $config = useRuntimeConfig()
  const { ...options } = defu($config.salesforce, $config.public.salesforce)

  nuxtApp._salesforce.default = createSalesforceHelper(options)
  return nuxtApp._salesforce.default
}

export const useSalesforceQuery = <T = unknown>(
  query: string,
  params?: Record<string, any>,
  options: AsyncDataOptions<T> = {},
) => {
  const salesforce = useSalesforce()
  return useAsyncData<T>(
    'salesforce-' + objectHash(query + (params ? JSON.stringify(params) : '')),
    () => salesforce.fetch(query, params),
    options,
  )
}

export const useLazySalesforceQuery = <T = unknown>(
  query: string,
  params?: Record<string, any>,
  options: AsyncDataOptions<T> = {},
) => {
  const salesforce = useSalesforce()
  return useLazyAsyncData<T>(
    'salesforce-' + objectHash(query + (params ? JSON.stringify(params) : '')),
    () => salesforce.fetch(query, params),
    options,
  )
}
