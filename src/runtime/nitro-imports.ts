import { defu } from 'defu'

import type { SalesforceConfiguration } from './client'
import type { SalesforceHelper } from './composables'

import { createClient, checkRefreshToken } from './client'
import { useRuntimeConfig } from '#imports'

const $config = useRuntimeConfig()

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
  const { ...options } = defu($config.salesforce, $config.public.salesforce)

  const client = createSalesforceHelper(options)
  return client
}
