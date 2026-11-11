import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The next mastery award serial
 * @class
 */
@Packet(Outgoing.MinigameMastery, 'xt')
export class MinigameMasteryOutgoing extends OutgoingPacket {
  /**
   * The serial
   */
  @Field.int() public readonly serial: number = 0

  /**
   * Whether the pet mastered the game
   */
  @Field.string() public readonly mastered: string = '0'

  /**
   * Sends the serial
   * @param serial The serial
   * @param mastered Whether the pet just mastered the game
   * @returns The packet
   */
  public static of(serial: number, mastered: boolean): MinigameMasteryOutgoing {
    return PacketFactory.create<MinigameMasteryOutgoing>(
      MinigameMasteryOutgoing,
      {
        room: -1,
        serial,
        mastered: mastered ? '1' : '0',
      },
    )
  }
}
