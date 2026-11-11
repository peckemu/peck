import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A prize offered to a player
 */
export type OfferedPrize = {
  /**
   * The user variable the answer sets
   */
  readonly userVarId: number

  /**
   * Whether it is clothing
   */
  readonly clothing: boolean

  /**
   * The prize's definition id
   */
  readonly defId: number

  /**
   * The prize's name string
   */
  readonly nameStrId: number

  /**
   * The prize's description string
   */
  readonly descStrId: number

  /**
   * The prize's colour
   */
  readonly color: number
}

/**
 * A prize to keep or throw away
 * @class
 */
@Packet(Outgoing.ItemPrize, 'xt')
export class ItemPrizeOutgoing extends OutgoingPacket {
  /**
   * The user variable the answer sets
   */
  @Field.int() public readonly userVarId: number = 0

  /**
   * Whether it is clothing
   */
  @Field.bool() public readonly clothing: boolean = false

  /**
   * The prize's definition id
   */
  @Field.int() public readonly defId: number = 0

  /**
   * The prize's name string
   */
  @Field.int() public readonly nameStrId: number = 0

  /**
   * The prize's description string
   */
  @Field.int() public readonly descStrId: number = 0

  /**
   * The prize's colour
   */
  @Field.uint() public readonly color: number = 0

  /**
   * Offers a prize
   * @param prize The prize
   * @returns The packet
   */
  public static of(prize: OfferedPrize): ItemPrizeOutgoing {
    return PacketFactory.create<ItemPrizeOutgoing>(ItemPrizeOutgoing, {
      room: -1,
      ...prize,
    })
  }
}
