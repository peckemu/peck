import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * An eco item's switch
 */
export type DenEcoConsumer = {
  /**
   * Its place in the owner's den items
   */
  readonly invIdx: number

  /**
   * 0 off, 1 on, 2 offline
   */
  readonly stateId: number
}

/**
 * The den's eco item switches
 * @class
 */
@Packet(Outgoing.DenEcoConsumer, 'xt')
export class DenEcoConsumerOutgoing extends OutgoingPacket {
  /**
   * The power drawn
   */
  @Field.int() public readonly ecoPointsConsumed: number = 0

  /**
   * The den's eco score
   */
  @Field.int() public readonly ecoScore: number = 0

  /**
   * The eco items
   */
  @Field.list(Field.object({ invIdx: Field.int(), stateId: Field.int() }))
  public readonly consumers: readonly DenEcoConsumer[] = []

  /**
   * Lists the den's eco item switches
   * @param room The target room
   * @param ecoPointsConsumed The power drawn
   * @param ecoScore The den's eco score
   * @param consumers The eco items
   * @returns The packet
   */
  public static of(
    room: number,
    ecoPointsConsumed: number,
    ecoScore: number,
    consumers: readonly DenEcoConsumer[],
  ): DenEcoConsumerOutgoing {
    return PacketFactory.create<DenEcoConsumerOutgoing>(
      DenEcoConsumerOutgoing,
      { room, ecoPointsConsumed, ecoScore, consumers },
    )
  }
}
