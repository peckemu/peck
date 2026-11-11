import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a bundle was bought
 * @class
 */
@Packet(Outgoing.DiamondBundle, 'xt')
export class DiamondBundleOutgoing extends OutgoingPacket {
  /**
   * Whether it was bought
   */
  @Field.string() public readonly bought: string = 'false'

  /**
   * The diamonds left
   */
  @Field.optional(Field.int()) public readonly diamonds?: number

  /**
   * Says the bundle was bought
   * @param room The target room
   * @param diamonds The diamonds left
   * @returns The packet
   */
  public static bought(room: number, diamonds: number): DiamondBundleOutgoing {
    return PacketFactory.create<DiamondBundleOutgoing>(DiamondBundleOutgoing, {
      room,
      bought: 'true',
      diamonds,
    })
  }

  /**
   * Says the bundle wasn't bought
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): DiamondBundleOutgoing {
    return PacketFactory.create<DiamondBundleOutgoing>(DiamondBundleOutgoing, {
      room,
      bought: 'false',
    })
  }
}
