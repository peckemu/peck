import { z } from 'zod'

/**
 * A sign in
 */
export const signInSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
  device: z.string().min(1).max(80).default('Unknown device'),
})

/**
 * A refresh
 */
export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})
