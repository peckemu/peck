import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A newspaper page was seen
 * @class
 */
@Packet(Outgoing.NewspaperSeen, 'xt')
export class NewspaperSeenOutgoing extends OutgoingPacket {
  /**
   * The page's definition id
   */
  @Field.int() public readonly defId: number = 0

  /**
   * The seen time in seconds
   */
  @Field.int() public readonly timeSeen: number = 0

  /**
   * Confirms a page was seen
   * @param room The target room
   * @param defId The page's definition id
   * @param timeSeen The seen time in seconds
   * @returns The packet
   */
  public static of(
    room: number,
    defId: number,
    timeSeen: number,
  ): NewspaperSeenOutgoing {
    return PacketFactory.create<NewspaperSeenOutgoing>(NewspaperSeenOutgoing, {
      room,
      defId,
      timeSeen,
    })
  }
}
