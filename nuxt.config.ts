import { useNuxt } from '@nuxt/kit'

const UNWANTED_LAYER_MODULES = ['@nuxt/content', 'nuxt-studio', '@nuxthub/core', 'contentRedirectsModule']

export default defineNuxtConfig({
  compatibilityDate: '2026-03-01',

  // Nuxt Layers: inherit the jednadvacet.org base (theme, layout, AppNavBar/AppFooter).
  extends: ['github:jednadvacetorg/website#master'],

  css: ['~/assets/css/main.css'],

  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@vueuse/nuxt',
  ],

  // The base layer is consumed only for its style, shared components and layouts.
  // Its config merges in CMS/DB infra this standalone app doesn't use
  // (@nuxt/content, nuxt-studio, @nuxthub/core, a custom contentRedirects module).
  // Strip those merged modules before they install so nothing tries to load them.
  hooks: {
    'modules:before'() {
      const nuxt = useNuxt()
      const isUnwanted = (m: unknown) => {
        const name = typeof m === 'string' ? m : Array.isArray(m) ? String(m[0]) : String(m)
        return UNWANTED_LAYER_MODULES.some((u) => name.includes(u))
      }
      nuxt.options.modules = nuxt.options.modules.filter((m) => !isUnwanted(m))
      // The unwanted entries also live on the extended layer's config; clear them
      // there too so nothing re-registers the base's CMS/DB modules.
      for (const layer of nuxt.options._layers ?? []) {
        const mods = layer?.config?.modules
        if (Array.isArray(mods)) {
          layer.config.modules = mods.filter((m: unknown) => !isUnwanted(m))
        }
      }
    },
    // The base layer ships Nuxt Content-coupled components/composables we don't
    // use here (this app has its own layout). Stop them from being auto-registered
    // so they aren't compiled/typechecked and can't reference the removed
    // queryCollection/@nuxt/content APIs.
    'components:dirs'(dirs) {
      for (let i = dirs.length - 1; i >= 0; i--) {
        const d = dirs[i]
        const path = typeof d === 'string' ? d : (d as any)?.path
        if (typeof path === 'string' && path.includes('.c12/')) dirs.splice(i, 1)
      }
    },
    'imports:dirs'(dirs) {
      for (let i = dirs.length - 1; i >= 0; i--) {
        if (typeof dirs[i] === 'string' && dirs[i]!.includes('.c12/')) dirs.splice(i, 1)
      }
    },
    'prepare:types'(ctx: any) {
      const tsConfig = ctx?.tsConfig
      if (!tsConfig) return
      if (Array.isArray(tsConfig.include)) {
        tsConfig.include = tsConfig.include.filter(
          (p: string) => !(p.includes('.c12/') && /\/app\//.test(p)),
        )
      }
    },
  },

  nitro: {
    routeRules: {
      '/api/data': { cache: { maxAge: 60 * 60 } },
      '/api/btc-price': { cache: { maxAge: 60 * 60 } },
    },
    prerender: {
      routes: ['/'],
      crawlLinks: false,
    },
  },

  vite: {
    server: {
      allowedHosts: true,
    },
  },
})
