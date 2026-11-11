import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The text that sends the client to another server
 */
const FORCE_RELOGIN = '__FORCE_RELOGIN__'

/**
 * A message from Animal Jam
 * @class
 */
@Packet(Outgoing.AdminMessage, 'xt', { roomless: true })
export class AdminMessageOutgoing extends OutgoingPacket {
  /**
   * The message, or a translation id and its values
   */
  @Field.string() public readonly text: string = ''

  /**
   * Whether it is a system message
   */
  @Field.bool() public readonly system: boolean = true

  /**
   * Shows a system message
   * @param text The message
   * @returns The packet
   */
  public static system(text: string): AdminMessageOutgoing {
    return PacketFactory.create<AdminMessageOutgoing>(AdminMessageOutgoing, {
      text,
      system: true,
    })
  }

  /**
   * Shows a broadcast
   * @param text The message
   * @returns The packet
   */
  public static broadcast(text: string): AdminMessageOutgoing {
    return PacketFactory.create<AdminMessageOutgoing>(AdminMessageOutgoing, {
      text,
      system: false,
    })
  }

  /**
   * Shows a translated message
   * @param id The translation id
   * @param values The values put into it
   * @param system Whether it is a system message
   * @returns The packet
   */
  public static translated(
    id: number,
    values: readonly string[],
    system: boolean,
  ): AdminMessageOutgoing {
    return PacketFactory.create<AdminMessageOutgoing>(AdminMessageOutgoing, {
      text: [String(id), ...values].join('|'),
      system,
    })
  }

  /**
   * Sends the client to another server
   * @returns The packet
   */
  public static relogin(): AdminMessageOutgoing {
    return AdminMessageOutgoing.system(FORCE_RELOGIN)
  }
}
