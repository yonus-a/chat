// types/runtimeConfig.d.ts
declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    apiBaseUrl: string
    platformApiBaseUrl: string
    domainName: string
    vapidPublicKey: string
    altchaChallengeUrl: string
    mqttWsUrl: string
    sentryDsn: string
    sentryTracesSampleRate: number
    google: {
      scope: string
      clientId: string
      redirectUri: string
    }
    mapTileServerPath: string
  }
}

// Important: ensure this file is treated as a module
export {}