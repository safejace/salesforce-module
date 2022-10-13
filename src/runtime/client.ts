import { $fetch } from 'ohmyfetch'
const apiHost = 'safe--staging.sandbox.my.salesforce-sites.com/api'

export type SalesforceClient = ReturnType<typeof createClient>

export interface SalesforceCredentials {
  username?: string
  password?: string
}

export interface SalesforceOAuthConfiguration {
  clientId: string
  clientSecret: string
  refreshToken: string
}

export interface SalesforceConfiguration {
  accountId: string
  grantType?: string
  credentials?: SalesforceCredentials
  oauth?: SalesforceOAuthConfiguration
  accessToken?: string
}

export function getQuery(query: string) {
  const soql = query.replace(/\s+/g, '+')
  return `?q=${soql}`
}

export async function checkRefreshToken(config: SalesforceConfiguration) {
  const params = {
    grant_type: config.grantType,
    client_id: config.oauth?.clientId,
    client_secret: config.oauth?.clientSecret,
    refresh_token: config.oauth?.refreshToken,
  }
  const query = new URLSearchParams(params).toString()

  const urlBase = `https://${apiHost}/services/oauth2/token?`
  const response = await $fetch(`${urlBase}${query}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return response.access_token
}

export function createClient(config: SalesforceConfiguration) {
  const { accountId, accessToken } = config

  const fetchOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      method: 'GET',
      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),
      Accept: 'application/json',
      ...(process.server ? { 'accept-encoding': 'gzip, deflate' } : {}),
    },
  }

  return {
    clone: () =>
      createClient({
        accountId,
      }),
    /**
     * Perform a fetch using SOQL syntax.
     */
    async fetch<T = unknown>(query: string, _params?: Record<string, any>) {
      const qs = getQuery(query)

      const host = apiHost
      const urlBase = `https://${host}/services/data/v55.0/query/`

      const result = await $fetch<{ result: T }>(
        `${urlBase}${qs}`,
        fetchOptions
      )
      return result
    },
  }
}
