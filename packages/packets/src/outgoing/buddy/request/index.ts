import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * What came of a buddy request
 */
export const BuddyRequestStatus = {
  /**
   * Someone asks this player
   */
  Asked: 0,

  /**
   * Sent
   */
  Sent: 1,

  /**
   * Their list is full
   */
  TheirListFull: 2,

  /**
   * They don't take requests
   */
  NotTaking: 3,

  /**
   * The player's list is full
   */
  MyListFull: 4,

  /**
   * This player blocks them
   */
  UnblockFirst: 5,
} as const

export type BuddyRequestStatus =
  (typeof BuddyRequestStatus)[keyof typeof BuddyRequestStatus]

/**
 * What came of a buddy request
 * @class
 */
@Packet(Outgoing.BuddyRequest, 'xt')
export class BuddyRequestOutgoing extends OutgoingPacket {
  /**
   * What came of it
   */
  @Field.int() public readonly status: number = 0

  /**
   * The other player's username
   */
  @Field.string() public readonly userName: string = ''

  /**
   * Whether the name can be shown
   */
  @Field.int() public readonly userNameModerated: number = 1

  /**
   * Says what came of a buddy request
   * @param room The target room
   * @param status What came of it
   * @param userName The other player's username
   * @returns The packet
   */
  public static of(
    room: number,
    status: BuddyRequestStatus,
    userName: string,
  ): BuddyRequestOutgoing {
    return PacketFactory.create<BuddyRequestOutgoing>(BuddyRequestOutgoing, {
      room,
      status,
      userName,
      userNameModerated: 1,
    })
  }
}
