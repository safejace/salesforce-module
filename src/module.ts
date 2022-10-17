import { fileURLToPath } from 'url'
import { join } from 'pathe'
import { defu } from 'defu'
import {
  defineNuxtModule,
  addImports,
  addComponentsDir,
} from '@nuxt/kit'

import { name, version } from '../package.json'

import type { SalesforceConfiguration } from './runtime/client'
export interface SalesforceModuleOptions
  extends Partial<SalesforceConfiguration> {}

export type ModuleOptions = SalesforceModuleOptions

const CONFIG_KEY = 'salesforce' as const

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: CONFIG_KEY,
  },
  defaults: _nuxt => ({
    grantType: 'password',
  }),
  async setup (options, nuxt) {
    nuxt.options.runtimeConfig.public.salesforce = defu(
      nuxt.options.runtimeConfig.public.salesforce,
      {
        accountId: options.accountId,
        domain: options.domain,
        grantType: options.grantType,
        credentials: options.credentials,
        oauth: options.oauth,
        accessToken: options.accessToken,
        apiVersion: options.apiVersion,
        sandbox: options.sandbox,
        instance: options.instance,
      },
    )

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    addImports(
      [
        {
          name: 'createClient',
          as: 'createClient',
          from: join(runtimeDir, 'composables'),
        },
        { name: 'soql', as: 'soql', from: join(runtimeDir, 'soql') },
        {
          name: 'useSalesforce',
          as: 'useSalesforce',
          from: join(runtimeDir, 'composables'),
        },
        {
          name: 'useLazySalesforceQuery',
          as: 'useLazySalesforceQuery',
          from: join(runtimeDir, 'composables'),
        },
        {
          name: 'useSalesforceQuery',
          as: 'useSalesforceQuery',
          from: join(runtimeDir, 'composables'),
        },
      ].filter(Boolean),
    )

    nuxt.hook('nitro:config', (config) => {
      if (config.imports === false) return
      config.externals ||= {}
      config.externals.inline ||= []
      config.externals.inline.push(runtimeDir)

      config.imports = defu(config.imports, {
        presets: [
          {
            from: join(runtimeDir, 'nitro-imports'),
            imports: ['useSalesforce'],
          },
          {
            from: join(runtimeDir, 'soql'),
            imports: ['soql'],
          },
        ],
      })
    })

    await addComponentsDir({
      path: join(runtimeDir, 'components'),
      extensions: ['js', 'ts', 'mjs'],
    })
  },
})
