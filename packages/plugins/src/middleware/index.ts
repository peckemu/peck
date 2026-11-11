import { type PacketContext } from '#plugins/context'

/**
 * Middleware
 */
export type Middleware = (
  context: PacketContext,
  next: () => Promise<void>,
) => Promise<void>
