import { z } from 'zod'

/**
 * A masterpiece id in the path
 */
export const masterpieceIdSchema = z.object({
  id: z.string().regex(/^ps-[\da-f-]{36}$/),
})

/**
 * A staff decision
 */
export const decisionSchema = z.object({
  approve: z.boolean(),
})
