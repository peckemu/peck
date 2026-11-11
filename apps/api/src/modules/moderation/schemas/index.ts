import { z } from 'zod'

/**
 * A report or sanction id in the path
 */
export const moderationIdSchema = z.object({
  id: z.uuid(),
})
