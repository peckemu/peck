import { injectable } from '@needle-di/core'
import { type IncomingPacket, type IncomingPacketType } from '@peck/protocol'

import { type PacketContext } from '#plugins/context'

/**
 * A packet handler
 * @class
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- names the packet the handler takes
export abstract class PacketHandler<T extends IncomingPacket = IncomingPacket> {
  /**
   * The packet class it handles
   */
  declare public static readonly packet: IncomingPacketType

  /**
   * Whether it replaces an existing handler
   */
  declare public static readonly replaces: boolean

  /**
   * Handles one packet
   * @param packet The packet
   * @param context The packet context
   */
  public abstract handle(
    packet: T,
    context: PacketContext,
  ): void | Promise<void>
}

/**
 * A handler class
 */
export type HandlerType = (new () => PacketHandler) & {
  readonly packet: IncomingPacketType
  readonly replaces: boolean
  readonly name: string
}

/**
 * Handler options
 */
export type HandlerOptions = {
  /**
   * Whether it replaces an existing handler
   */
  readonly replace?: boolean
}

/**
 * A handler's packet
 */
type Handles<C> = C extends new () => {
  handle(packet: infer P, ...rest: never[]): unknown
}
  ? P
  : never

/**
 * Checks the handler's packet
 */
type Matches<C, T> =
  unknown extends Handles<C>
    ? unknown
    : [Handles<C>] extends [T]
      ? [T] extends [Handles<C>]
        ? unknown
        : never
      : never

/**
 * Marks a class as a packet handler
 * @param packet The packet class it handles
 * @param options The handler options
 * @returns The class decorator
 */
export const Handler =
  <T extends IncomingPacket>(
    packet: IncomingPacketType<T>,
    options: HandlerOptions = {},
  ) =>
  <C extends new () => PacketHandler>(
    target: C & Matches<C, T>,
    _context: ClassDecoratorContext,
  ): void => {
    injectable()(target)
    Object.defineProperties(target, {
      packet: { value: packet },
      replaces: { value: options.replace ?? false },
    })
  }
