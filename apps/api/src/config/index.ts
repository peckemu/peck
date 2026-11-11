/**
 * Reads a required environment variable
 * @param key The variable name
 * @returns Its value
 */
const required = (key: string): string => {
  const value = Bun.env[key]
  if (!value) throw new Error(`Missing ${key}`)
  return value
}

/**
 * The API config
 */
export const config = {
  port: Number(Bun.env['API_PORT'] ?? 3000),
  url:
    Bun.env['API_URL'] ?? `http://127.0.0.1:${Bun.env['API_PORT'] ?? '3000'}`,
  databaseUrl: required('DATABASE_URL'),
  redisUrl: required('REDIS_URL'),
  game: {
    content: Bun.env['CONTENT_URL'] ?? '',
    deployVersion: Bun.env['GAME_DEPLOY_VERSION'] ?? '',
    buildVersion: Bun.env['GAME_BUILD_VERSION'] ?? '',
    website: Bun.env['WEBSITE_URL'] ?? 'http://127.0.0.1',
  },
  bucket: {
    name: Bun.env['S3_BUCKET'] ?? '',
    endpoint: Bun.env['S3_ENDPOINT'] ?? '',
    region: Bun.env['S3_REGION'] ?? 'auto',
    accessKeyId: Bun.env['S3_ACCESS_KEY_ID'] ?? '',
    secretAccessKey: Bun.env['S3_SECRET_ACCESS_KEY'] ?? '',
  },
  origins: (Bun.env['API_ORIGINS'] ?? '').split(',').filter(Boolean),
  logLevel: Bun.env['LOG_LEVEL'] ?? 'info',
  logPretty:
    (Bun.env['LOG_PRETTY'] ?? String(Bun.env.NODE_ENV !== 'production')) ===
    'true',
}

/**
 * The API config's shape
 */
export type Config = typeof config
