import { type IncomingPacket, type IncomingPacketType } from '@peck/protocol'

import { type HandlerType } from '#plugins/handler'

/**
 * The handler registry
 * @class
 */
export class HandlerRegistry implements Iterable<HandlerType> {
  /**
   * The handler classes by packet class
   */
  private readonly types = new Map<IncomingPacketType, HandlerType>()

  /**
   * Creates a registry
   * @param types The handler classes
   * @returns The registry
   */
  public static of(types: Iterable<HandlerType>): HandlerRegistry {
    const registry = new HandlerRegistry()
    for (const type of types) registry.register(type)
    return registry
  }

  /**
   * The number of handlers
   */
  public get size(): number {
    return this.types.size
  }

  /**
   * Adds a handler
   * @param type The handler class
   */
  public register(type: HandlerType): void {
    const existing = this.types.get(type.packet)
    if (existing && !type.replaces) {
      throw new Error(
        `${type.packet.name} is already handled by ${existing.name}`,
      )
    }
    this.types.set(type.packet, type)
  }

  /**
   * Finds a packet's handler class
   * @param packet The packet
   * @returns The handler class, or null
   */
  public resolve(packet: IncomingPacket): HandlerType | null {
    return this.types.get(packet.constructor as IncomingPacketType) ?? null
  }

  /**
   * Iterates over the handler classes
   * @returns The iterator
   */
  public [Symbol.iterator](): Iterator<HandlerType> {
    return this.types.values()
  }
}
