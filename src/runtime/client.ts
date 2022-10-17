import { $fetch } from 'ohmyfetch'
const apiHost = 'my.salesforce-sites.com/api'

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
  domain: string
  grantType?: string
  credentials?: SalesforceCredentials
  oauth?: SalesforceOAuthConfiguration
  accessToken?: string
  apiVersion?: string
  sandbox?: string
  instance?: string
}

const enc = encodeURIComponent

export function getQuery (query: string, params: Record<string, any> = {}) {
  const baseQs = `?q=${enc(query)}`

  return Object.keys(params).reduce((current, param) => {
    return `${current}&${enc(`$${param}`)}=${enc(
      JSON.stringify(params[param]),
    )}`
  }, baseQs)
}

export async function checkRefreshToken (config: SalesforceConfiguration) {
  const params = {
    grant_type: config.grantType,
    client_id: config.oauth?.clientId,
    client_secret: config.oauth?.clientSecret,
    refresh_token: config.oauth?.refreshToken,
  }
  const query = new URLSearchParams(params).toString()
  const host = config.sandbox
    ? `${config.domain}--${config.sandbox}.${config.instance}.${apiHost}`
    : `${config.domain}.${apiHost}`

  const urlBase = `https://${host}/services/oauth2/token?`

  const response = await $fetch(`${urlBase}${query}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return response.access_token
}

export function createClient (config: SalesforceConfiguration) {
  const { accountId, domain, accessToken } = config

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
    },
  }

  return {
    clone: () =>
      createClient({
        accountId,
        domain,
      }),
    /**
     * Perform a fetch using SOQL syntax.
     */
    async fetch<T = unknown> (
      endpoint: string,
      query?: string,
      params?: Record<string, any>,
    ) {
      const qs = query ? getQuery(query, params) : ''
      const apiVersion = config.apiVersion ?? 'v55.0'

      const host = config.sandbox
        ? `${config.domain}--${config.sandbox}.${config.instance}.${apiHost}`
        : `${config.domain}.${apiHost}`
      const urlBase = `https://${host}/services/data/${apiVersion}/`

      const result = await $fetch<{ result: T }>(
        `${urlBase}${endpoint}${qs}`,
        fetchOptions,
      )
      return result
    },
  }
}
