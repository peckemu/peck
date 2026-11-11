import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { type ListedBuddy } from '#packets/outgoing/buddy/list'
import { Outgoing } from '#packets/outgoing/headers'

/**
 * Why a buddy changed
 */
export const BuddyChange = {
  /**
   * They came online or went
   */
  Update: 0,

  /**
   * They took this player's request
   */
  Accepted: 1,

  /**
   * This player took their request
   */
  Added: 2,

  /**
   * They changed their username
   */
  Renamed: 3,
} as const

export type BuddyChange = (typeof BuddyChange)[keyof typeof BuddyChange]

/**
 * A buddy's avatar
 */
export type BuddyAvatar = {
  /**
   * Its name
   */
  readonly name: string

  /**
   * Its id among the buddy's avatars
   */
  readonly perUserId: number
}

/**
 * A buddy changed
 * @class
 */
@Packet(Outgoing.BuddyStatus, 'xt')
export class BuddyStatusOutgoing extends OutgoingPacket {
  /**
   * Whether the avatar follows
   */
  @Field.int() public readonly withAvatar: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Says a buddy changed
   * @param buddy The buddy
   * @param online Whether they are playing
   * @param change Why
   * @param avatar Their avatar
   * @returns The packet
   */
  public static of(
    buddy: ListedBuddy,
    online: boolean,
    change: BuddyChange,
    avatar?: BuddyAvatar,
  ): BuddyStatusOutgoing {
    const head = [
      buddy.username,
      buddy.uuid,
      '1',
      online ? '1' : '0',
      String(buddy.accountType),
      String(change),
    ]
    const tail = avatar ? [avatar.name, String(avatar.perUserId), '-1'] : ['']

    return PacketFactory.create<BuddyStatusOutgoing>(BuddyStatusOutgoing, {
      room: -1,
      withAvatar: avatar ? 1 : 0,
      body: [...head, ...tail],
    })
  }

  /**
   * Says a buddy changed their username
   * @param buddy The buddy's old username
   * @param online Whether they are playing
   * @param newUserName Their new username
   * @returns The packet
   */
  public static renamed(
    buddy: ListedBuddy,
    online: boolean,
    newUserName: string,
  ): BuddyStatusOutgoing {
    const body = [
      buddy.username,
      buddy.uuid,
      '1',
      online ? '1' : '0',
      String(buddy.accountType),
      String(BuddyChange.Renamed),
      newUserName,
    ]

    return PacketFactory.create<BuddyStatusOutgoing>(BuddyStatusOutgoing, {
      room: -1,
      withAvatar: 0,
      body,
    })
  }
}
