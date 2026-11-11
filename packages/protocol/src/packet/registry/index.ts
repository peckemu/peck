import { type PacketFormat } from '#protocol/wire/message'

/**
 * What a registry holds
 */
export type RegisteredPacket = {
  /**
   * The format of the packet
   */
  readonly format: PacketFormat
  /**
   * The header of the packet
   */
  readonly header: string
  /**
   * The name of the class
   */
  readonly name: string
}

/**
 * Holds packet classes by format and header
 * @class
 */
export class PacketRegistry<T extends RegisteredPacket> implements Iterable<T> {
  /**
   * The registered classes
   */
  private readonly types = new Map<string, T>()

  /**
   * The number of registered classes
   * @returns The number of registered classes
   */
  public get size(): number {
    return this.types.size
  }

  /**
   * Registers a packet class
   * @param type The packet class to register
   */
  public register(type: T): void {
    const key = `${type.format}:${type.header}`
    const existing = this.types.get(key)
    if (existing) throw new Error(`${key} is already used by ${existing.name}`)
    this.types.set(key, type)
  }

  /**
   * Retrieves a packet class
   * @param format The packet format
   * @param header The header of the packet
   * @returns The packet class
   */
  public resolve(format: PacketFormat, header: string): T | null {
    return this.types.get(`${format}:${header}`) ?? null
  }

  /**
   * Iterates over the registered classes
   * @returns An iterator over the registered classes
   */
  public [Symbol.iterator](): Iterator<T> {
    return this.types.values()
  }
}
