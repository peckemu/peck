import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The next gem award serial
 * @class
 */
@Packet(Outgoing.MinigameGems, 'xt')
export class MinigameGemsOutgoing extends OutgoingPacket {
  /**
   * The serial
   */
  @Field.int() public readonly serial: number = 0

  /**
   * Whether scores use it too
   */
  @Field.int() public readonly forScore: number = 0

  /**
   * Sends the serial
   * @param serial The serial
   * @param forScore Whether scores use it too
   * @returns The packet
   */
  public static of(serial: number, forScore: boolean): MinigameGemsOutgoing {
    return PacketFactory.create<MinigameGemsOutgoing>(MinigameGemsOutgoing, {
      room: -1,
      serial,
      forScore: forScore ? 1 : 0,
    })
  }
}
