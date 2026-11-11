// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  /**
   * Application head configuration, including external fonts
   */
  app: {
    head: {
      htmlAttrs: { 'data-theme': 'dark' },
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },

  /**
   * Development tools configuration
   */
  devtools: { enabled: true },

  /**
   * Source directory configuration
   */
  srcDir: 'src',

  /**
   * Components auto-import configuration
   */
  components: true,

  /**
   * Server side rendering configuration
   */
  ssr: false,

  /**
   * Module configuration
   */
  modules: [
    '@nuxt/image',
    '@nuxt/hints',
    '@nuxt/scripts',
    '@nuxt/eslint',
    '@sidebase/nuxt-auth',
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],

  /**
   * Css configuration
   */
  css: [
    /**
     * Vue3 Toastify styles
     */
    'vue3-toastify/dist/index.css',
    /**
     * Tailwind and the Peck theme
     */
    '~/assets/main.css',
    /**
     * Main application stylesheet
     */
    '~/assets/scss/app.scss',
  ],

  /**
   * Authentication module configuration
   */
  auth: {
    isEnabled: true,
    baseURL: process.env.NUXT_PUBLIC_BASE_URL || 'http://127.0.0.1:3000',
    provider: {
      type: 'local',
      endpoints: {
        signIn: {
          method: 'post',
          path: '/auth/sessions',
        },
        signOut: {
          method: 'delete',
          path: '/auth/sessions/current',
        },
        getSession: {
          method: 'get',
          path: '/accounts/me',
        },
      },
      session: {
        dataType: {
          id: 'string',
          username: 'string',
          email: 'string',
          emailConfirmed: 'boolean',
          createdAt: 'string',
        },
        dataResponsePointer: '/',
      },
      token: {
        signInResponseTokenPointer: '/token',
        maxAgeInSeconds: 86400,
        sameSiteAttribute: 'lax',
      },
      refresh: {
        isEnabled: true,
        endpoint: { path: '/auth/sessions/refresh', method: 'post' },
        refreshOnlyToken: false,
        token: {
          signInResponseRefreshTokenPointer: '/refreshToken',
          refreshRequestTokenPointer: '/refreshToken',
          maxAgeInSeconds: 2592000,
        },
      },
      pages: {
        login: '/login',
      },
    },
    globalAppMiddleware: false,
  },

  /**
   * Runtime configuration
   */
  runtimeConfig: {
    public: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      BASE_URL: process.env.NUXT_PUBLIC_BASE_URL || 'http://127.0.0.1:3000',
      SITE_NAME: process.env.NUXT_PUBLIC_SITE_NAME || 'Peck',
    },
  },

  /**
   * Build configuration
   */
  build: {
    transpile: ['@peck/ui'],
  },

  /**
   * Vite configuration
   */
  vite: {
    plugins: [tailwindcss()],
  },
})
