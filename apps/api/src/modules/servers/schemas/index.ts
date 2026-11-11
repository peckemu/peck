import { z } from 'zod'

/**
 * A node id in the path
 */
export const serverIdSchema = z.object({
  id: z.coerce.number().int().min(0),
})

/**
 * A drain
 */
export const drainSchema = z.object({
  draining: z.boolean(),
})
