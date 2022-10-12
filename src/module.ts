import { fileURLToPath } from 'url'
import { join, resolve } from 'pathe'
import { defu } from 'defu'
import {
  defineNuxtModule,
  addPlugin,
  addImports,
  addComponentsDir,
} from '@nuxt/kit'

import { name, version } from '../package.json'

import type { SalesforceConfiguration } from './runtime/client'
export interface SalesforceModuleOptions
  extends Partial<SalesforceConfiguration> {
  /** Globally register a $salesforce helper throughout your app */
  globalHelper?: boolean
}

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
    // console.log('options: ', nuxt.options.runtimeConfig.public.salesforce)
    // console.log('options: ', nuxt.options.salesforce)
    // do config checks here

    nuxt.options.runtimeConfig.public.salesforce = defu(
      nuxt.options.runtimeConfig.public.salesforce,
      {
        accountId: options.accountId,
        grantType: options.grantType,
        credentials: options.credentials,
        oauth: options.oauth,
        accessToken: options.accessToken,
      },
    )

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)
    if (options.globalHelper) {
      addPlugin(resolve(runtimeDir, 'plugin'))
    }

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
