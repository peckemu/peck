import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A buddy in the list
 */
export type ListedBuddy = {
  /**
   * Their username
   */
  readonly username: string

  /**
   * Their uuid
   */
  readonly uuid: string

  /**
   * Their account type
   */
  readonly accountType: number
}

/**
 * Not at a party
 */
const NO_PARTY = '-1'

/**
 * Whether the name can be shown
 */
const NAME_SHOWN = '1'

/**
 * The buddy or blocked list
 * @class
 */
@Packet(Outgoing.BuddyList, 'xt')
export class BuddyListOutgoing extends OutgoingPacket {
  /**
   * 0 buddies, 1 blocked
   */
  @Field.int() public readonly kind: number = 0

  /**
   * The list
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists the buddies
   * @param room The target room
   * @param online The buddies playing
   * @param offline The buddies not playing
   * @returns The packet
   */
  public static buddies(
    room: number,
    online: readonly ListedBuddy[],
    offline: readonly ListedBuddy[],
  ): BuddyListOutgoing {
    const entry = (buddy: ListedBuddy): string[] => [
      buddy.username,
      buddy.uuid,
      NAME_SHOWN,
      String(buddy.accountType),
    ]

    const body = [
      String(online.length),
      ...online.flatMap((buddy) => [...entry(buddy), NO_PARTY]),
      String(offline.length),
      ...offline.flatMap(entry),
    ]

    return PacketFactory.create<BuddyListOutgoing>(BuddyListOutgoing, {
      room,
      kind: 0,
      body,
    })
  }

  /**
   * Lists the players blocked
   * @param room The target room
   * @param usernames Their usernames
   * @returns The packet
   */
  public static blocked(
    room: number,
    usernames: readonly string[],
  ): BuddyListOutgoing {
    return PacketFactory.create<BuddyListOutgoing>(BuddyListOutgoing, {
      room,
      kind: 1,
      body: [String(usernames.length), ...usernames],
    })
  }
}
