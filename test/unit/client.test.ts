import { afterEach, describe, it, vi, expect } from 'vitest'
import { $fetch } from 'ohmyfetch'
import { getQuery, createClient } from '../../src/runtime/client'

vi.mock('ohmyfetch', () => ({
  $fetch: vi.fn(() => Promise.resolve({ result: [1, 2] })),
}))

describe('salesforce client', () => {
  const defaultOptions = {
    accountId: '12345',
  }
  afterEach(() => {
    vi.clearAllMocks()
  })

  it.only('correctly encodes soql query', () => {
    const encoded = getQuery('SELECT name FROM Account')

    expect(encoded).toBe('?q=SELECT+name+FROM+Account')
  })

  it.only('creates a client with the correct methods', () => {
    const client = createClient({
      ...defaultOptions,
      grantType: 'refresh_token',
    })
    expect(Object.keys(client)).toEqual(['clone', 'fetch'])
  })

  it.only('sends a GET request for smaller queries', () => {
    const client = createClient({
      ...defaultOptions,
    })
    client.fetch('SELECT name FROM Account')

    expect($fetch).toBeCalledWith(
      'https://safe--staging.sandbox.my.salesforce-sites.com/api/services/data/v55.0/query/?q=SELECT+name+FROM+Account',
      expect.objectContaining({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          method: 'GET',
        },
      }),
    )
  })

  it.only('can clone the client', () => {
    const client = createClient({
      ...defaultOptions,
    })
    const newClient = client.clone()
    expect(Object.keys(newClient)).toEqual(['clone', 'fetch'])
    expect(newClient).not.toEqual(client)
  })

  it.skip('uses passes an oauth token and credentials', async () => {
    // @TODO figure it out
    const token = 'myToken'
    const client = createClient({
      ...defaultOptions,
      grantType: 'refresh_token',
      oauth: {
        clientId: 'client_id',
        clientSecret: 'client_secret',
        refreshToken: 'refresh_token',
      },
    })
    await client.fetch('SELECT name FROM Account')

    expect($fetch).toBeCalledWith(
      expect.stringContaining(
        'https://safe--staging.sandbox.my.salesforce-sites.com/api/services/data/v55.0/query/?q=SELECT+name+FROM+Account',
      ),
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          method: 'GET',
          Authorization: `Bearer ${token}`,
        },
      },
    )
  })
})
