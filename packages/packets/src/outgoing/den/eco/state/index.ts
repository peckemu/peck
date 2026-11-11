import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A den's eco system
 */
export type DenEcoState = {
  /**
   * The placed wind turbines
   */
  readonly numActiveWindTurbines: number

  /**
   * The placed solar panels
   */
  readonly numActiveSolarPanels: number

  /**
   * The eco items
   */
  readonly numConsumerItems: number

  /**
   * The power made
   */
  readonly ecoPowerGeneration: number

  /**
   * The power drawn
   */
  readonly ecoPowerConsumption: number

  /**
   * The eco score the next gift needs
   */
  readonly ecoScoreRequired: number

  /**
   * The next gift's bit, or -1
   */
  readonly nextRewardBitIndex: number

  /**
   * Eco credits earned but not yet redeemed
   */
  readonly unredeemedEcoCredits: number

  /**
   * Seconds to the next eco credit
   */
  readonly secondsUntilNextEcoCredit: number
}

/**
 * The den's eco system
 * @class
 */
@Packet(Outgoing.DenEcoState, 'xt')
export class DenEcoStateOutgoing extends OutgoingPacket {
  /**
   * The placed wind turbines
   */
  @Field.int() public readonly numActiveWindTurbines: number = 0

  /**
   * The placed solar panels
   */
  @Field.int() public readonly numActiveSolarPanels: number = 0

  /**
   * The eco items
   */
  @Field.int() public readonly numConsumerItems: number = 0

  /**
   * The power made
   */
  @Field.int() public readonly ecoPowerGeneration: number = 0

  /**
   * The power drawn
   */
  @Field.int() public readonly ecoPowerConsumption: number = 0

  /**
   * The eco score the next gift needs
   */
  @Field.int() public readonly ecoScoreRequired: number = 0

  /**
   * The next gift's bit, or -1
   */
  @Field.int() public readonly nextRewardBitIndex: number = -1

  /**
   * Eco credits earned but not yet redeemed
   */
  @Field.int() public readonly unredeemedEcoCredits: number = 0

  /**
   * Seconds to the next eco credit
   */
  @Field.int() public readonly secondsUntilNextEcoCredit: number = 0

  /**
   * Describes the den's eco system
   * @param room The target room
   * @param state The eco system
   * @returns The packet
   */
  public static of(room: number, state: DenEcoState): DenEcoStateOutgoing {
    return PacketFactory.create<DenEcoStateOutgoing>(DenEcoStateOutgoing, {
      room,
      ...state,
    })
  }
}
