import { zValidator } from '@hono/zod-validator'
import { type MiddlewareHandler, type ValidationTargets } from 'hono'
import { type z, type ZodType } from 'zod'

import { type Context } from '#api/types'

/**
 * Request validation middleware
 */
export type Validated<
  T extends ZodType,
  K extends keyof ValidationTargets,
> = MiddlewareHandler<
  Context,
  string,
  { in: Record<K, z.input<T>>; out: Record<K, z.output<T>> }
>

/**
 * Validates part of a request
 * @param target The part to validate
 * @param schema The schema
 * @returns The middleware
 */
export const validate = <T extends ZodType, K extends keyof ValidationTargets>(
  target: K,
  schema: T,
): Validated<T, K> =>
  zValidator(target, schema, (result, c) => {
    if (result.success) return

    const message = result.error.issues[0]?.message ?? 'Invalid request'

    return c.json({ error: { code: 'INVALID', message } }, 400)
  }) as Validated<T, K>
