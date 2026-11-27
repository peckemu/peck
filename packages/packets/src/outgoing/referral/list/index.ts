import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * A player who joined with the code
 */
export type ReferralEntry = {
  /**
   * Their username
   */
  readonly username: string

  /**
   * Their name bar
   */
  readonly nameBarData: number

  /**
   * Whether they are a member
   */
  readonly member: boolean
}

/**
 * A referral as the client reads it
 */
type ReferralJson = {
  /**
   * Their username
   */
  readonly name: string

  /**
   * The name shown
   */
  readonly moderatedUserName: string

  /**
   * Their name bar
   */
  readonly namebarData: number

  /**
   * Their account type
   */
  readonly account_type: string
}

/**
 * A page of the player's referrals
 * @class
 */
@Packet(Outgoing.ReferralList, 'xt')
export class ReferralListOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly status: number = 0

  /**
   * The referrals as JSON
   */
  @Field.string() public readonly referrals: string = ''

  /**
   * Sends a page of referrals
   * @param room The target room
   * @param referrals The referrals
   * @returns The packet
   */
  public static of(
    room: number,
    referrals: readonly ReferralEntry[],
  ): ReferralListOutgoing {
    const list = referrals.map((referral): ReferralJson => ({
      name: referral.username,
      moderatedUserName: referral.username,
      namebarData: referral.nameBarData,
      account_type: referral.member ? 'Member' : 'Non-Member',
    }))

    return PacketFactory.create<ReferralListOutgoing>(ReferralListOutgoing, {
      room,
      status: 1,
      referrals: JSON.stringify({ referrals: list }),
    })
  }

  /**
   * Says the page was refused
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): ReferralListOutgoing {
    return PacketFactory.create<ReferralListOutgoing>(ReferralListOutgoing, {
      room,
      status: 0,
      referrals: '',
    })
  }
}
