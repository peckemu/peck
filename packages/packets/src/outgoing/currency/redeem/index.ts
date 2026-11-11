import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * What a redeemed code came to
 */
export const RedeemResult = {
  /**
   * The code worked
   */
  Redeemed: 1,

  /**
   * The code is not valid
   */
  Invalid: -1,

  /**
   * The account's email is not confirmed
   */
  Unverified: -3,
} as const

/**
 * What a redeemed code came to
 */
export type RedeemResult = (typeof RedeemResult)[keyof typeof RedeemResult]

/**
 * What a redeemed code came to
 * @class
 */
@Packet(Outgoing.RedeemCode, 'xt')
export class RedeemCodeOutgoing extends OutgoingPacket {
  /**
   * The result
   */
  @Field.int() public readonly result: number = 0

  /**
   * The details as JSON
   */
  @Field.string() public readonly details: string = ''

  /**
   * Whether gifts wait on another domain
   */
  @Field.bool() public readonly giftsElsewhere: boolean = false

  /**
   * Says what the code came to
   * @param room The target room
   * @param result The result
   * @returns The packet
   */
  public static of(room: number, result: RedeemResult): RedeemCodeOutgoing {
    return PacketFactory.create<RedeemCodeOutgoing>(RedeemCodeOutgoing, {
      room,
      result,
      details: '',
      giftsElsewhere: false,
    })
  }
}
