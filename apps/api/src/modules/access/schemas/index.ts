import { z } from 'zod'

/**
 * A role being saved
 */
export const roleSchema = z.object({
  name: z.string().trim().min(1).max(40),
  description: z.string().max(280).default(''),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Colour must be #rrggbb'),
  rank: z.number().int().min(1).max(99),
  permissions: z.array(z.string()).max(100).default([]),
})

/**
 * A role id in the path
 */
export const roleIdSchema = z.object({
  id: z.uuid(),
})

/**
 * An account id in the path
 */
export const accountIdSchema = z.object({
  id: z.uuid(),
})

/**
 * An account and permission in the path
 */
export const overridePathSchema = z.object({
  id: z.uuid(),
  permission: z.string().min(1).max(64),
})

/**
 * A role assignment
 */
export const assignSchema = z.object({
  roleId: z.uuid().nullable(),
})

/**
 * An override
 */
export const overrideSchema = z.object({
  effect: z.enum(['grant', 'revoke']),
})

/**
 * The paging query
 */
export const pageSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})
