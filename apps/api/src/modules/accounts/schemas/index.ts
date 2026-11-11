import { z } from 'zod'

/**
 * A new account
 */
export const registerSchema = z.object({
  username: z.string().regex(/^[A-Za-z0-9_]{3,20}$/, 'Username is not valid'),
  email: z.email('Email is not valid').max(254),
  password: z
    .string()
    .min(8, 'Password is too short')
    .max(128, 'Password is too long'),
})
