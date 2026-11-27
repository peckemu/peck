import { type PacketContext } from '../context/index.ts'

/**
 * Middleware
 */
export type Middleware = (
  context: PacketContext,
  next: () => Promise<void>,
) => Promise<void>
