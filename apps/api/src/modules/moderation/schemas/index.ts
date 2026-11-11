import { z } from 'zod'

/**
 * A report or sanction id in the path
 */
export const moderationIdSchema = z.object({
  id: z.uuid(),
})

/**
 * A host's game id in the path
 */
export const hostIdSchema = z.object({
  gameId: z.coerce.number().int().min(1),
})

/**
 * A Jam-a-Gram id in the path
 */
export const jamagramIdSchema = z.object({
  id: z.coerce.number().int().min(1),
})

/**
 * A message to every player
 */
export const broadcastSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1)
    .max(256)
    .refine((text) => !/[%|]/.test(text), 'Message has a reserved character'),
  system: z.boolean().default(true),
})

/**
 * A Jam-a-Gram's new message
 */
export const redactSchema = z.object({
  message: z
    .string()
    .max(256)
    .refine((text) => !text.includes('%'), 'Message has a reserved character')
    .default(''),
})
