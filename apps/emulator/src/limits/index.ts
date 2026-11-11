/**
 * The client limits
 */
export type Limits = {
  /**
   * The largest frame in bytes
   */
  readonly maxFrameBytes: number

  /**
   * The most connections at once
   */
  readonly maxConnections: number

  /**
   * The most connections per address
   */
  readonly maxConnectionsPerAddress: number

  /**
   * The packet rate
   */
  readonly packetRate: number

  /**
   * The packet burst
   */
  readonly packetBurst: number

  /**
   * The max queued chunks
   */
  readonly maxQueuedChunks: number

  /**
   * The refused packets a connection may send
   */
  readonly maxRefused: number

  /**
   * The login timeout in milliseconds
   */
  readonly loginTimeoutMs: number
}

/**
 * The default limits
 */
export const DEFAULT_LIMITS: Limits = {
  maxFrameBytes: 64 * 1024,
  maxConnections: 5000,
  maxConnectionsPerAddress: 10,
  packetRate: 30,
  packetBurst: 60,
  maxQueuedChunks: 32,
  maxRefused: 20,
  loginTimeoutMs: 15_000,
}
