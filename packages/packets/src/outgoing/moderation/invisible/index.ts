import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A moderator's unseen state
 * @class
 */
@Packet(Outgoing.Invisible, 'xt')
export class InvisibleOutgoing extends OutgoingPacket {
  /**
   * Whether they are unseen
   */
  @Field.bool() public readonly invisible: boolean = false

  /**
   * Tells a moderator's unseen state
   * @param room The target room
   * @param invisible Whether they are
   * @returns The packet
   */
  public static of(room: number, invisible: boolean): InvisibleOutgoing {
    return PacketFactory.create<InvisibleOutgoing>(InvisibleOutgoing, {
      room,
      invisible,
    })
  }
}
