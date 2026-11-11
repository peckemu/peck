import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { type AppearingAvatar } from '#packets/outgoing/avatar/joined'
import { Outgoing } from '#packets/outgoing/headers'
import { type ShownPet } from '#packets/outgoing/pet/list'

/**
 * A player looked up
 */
export type LookedUpPlayer = {
  /**
   * Their id in the room
   */
  readonly id: number

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

  /**
   * Their name bar
   */
  readonly nameBarData: number
}

/**
 * The looked up player's animal
 */
export type LookedUpAvatar = AppearingAvatar & {
  /**
   * Its slot
   */
  readonly invId: number

  /**
   * The eyes it wears
   */
  readonly eyesDefId: number

  /**
   * Its pattern, or 0
   */
  readonly patternDefId: number
}

/**
 * The looked up player's extras
 */
export type LookedUpExtras = {
  /**
   * Their pet, or null
   */
  readonly pet: ShownPet | null

  /**
   * The clothing worn
   */
  readonly items: readonly { readonly defId: number; readonly color: number }[]
}

/**
 * Whether the looked up player is playing
 */
const LookupStatus = {
  /**
   * Not playing
   */
  Offline: 0,

  /**
   * Playing
   */
  Online: 1,

  /**
   * Has no animal
   */
  Archived: 2,

  /**
   * No such player
   */
  Missing: 3,
} as const

/**
 * A player looked up
 * @class
 */
@Packet(Outgoing.AvatarLookup, 'xt')
export class AvatarLookupOutgoing extends OutgoingPacket {
  /**
   * The player's username
   */
  @Field.string() public readonly userName: string = ''

  /**
   * The player's uuid
   */
  @Field.string() public readonly uuid: string = ''

  /**
   * Whether they are playing
   */
  @Field.int() public readonly status: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Describes an online player
   * @param room The room
   * @param player The player
   * @param avatar Their animal
   * @param extras Their extras
   * @returns The packet
   */
  public static online(
    room: number,
    player: LookedUpPlayer,
    avatar: LookedUpAvatar,
    extras: LookedUpExtras,
  ): AvatarLookupOutgoing {
    return AvatarLookupOutgoing.build(
      room,
      LookupStatus.Online,
      player.id,
      player,
      avatar,
      extras,
    )
  }

  /**
   * Describes an offline player
   * @param room The room
   * @param player The player
   * @param avatar Their animal
   * @param extras Their extras
   * @returns The packet
   */
  public static offline(
    room: number,
    player: LookedUpPlayer,
    avatar: LookedUpAvatar,
    extras: LookedUpExtras,
  ): AvatarLookupOutgoing {
    return AvatarLookupOutgoing.build(
      room,
      LookupStatus.Offline,
      -1,
      player,
      avatar,
      extras,
    )
  }

  /**
   * Says a player has no animal
   * @param room The room
   * @param userName The name looked up
   * @returns The packet
   */
  public static archived(room: number, userName: string): AvatarLookupOutgoing {
    return PacketFactory.create<AvatarLookupOutgoing>(AvatarLookupOutgoing, {
      room,
      userName,
      uuid: '',
      status: LookupStatus.Archived,
      body: [],
    })
  }

  /**
   * Says there is no such player
   * @param room The room
   * @param userName The name looked up
   * @returns The packet
   */
  public static missing(room: number, userName: string): AvatarLookupOutgoing {
    return PacketFactory.create<AvatarLookupOutgoing>(AvatarLookupOutgoing, {
      room,
      userName,
      uuid: '',
      status: LookupStatus.Missing,
      body: [],
    })
  }

  /**
   * Builds the packet
   * @param room The room
   * @param status Whether they are playing
   * @param userId Their id in the room, or -1
   * @param player The player
   * @param avatar Their animal
   * @param extras Their extras
   * @returns The packet
   */
  private static build(
    room: number,
    status: number,
    userId: number,
    player: LookedUpPlayer,
    avatar: LookedUpAvatar,
    extras: LookedUpExtras,
  ): AvatarLookupOutgoing {
    const [color1, color2, color3] = avatar.colors
    const { pet, items } = extras

    const body = [
      String(player.accountType),
      '0',
      '0',
      String(avatar.perUserId),
      String(avatar.invId),
      String(player.nameBarData),
      String(avatar.typeId),
      String(avatar.customId),
      String(color1 >>> 0),
      String(color2 >>> 0),
      String(color3 >>> 0),
      avatar.name,
      String(avatar.eyesDefId),
      String(avatar.patternDefId),
      String(avatar.questLevel),
      String(items.length),
      String(userId),
      '1',
      String((pet?.lBits ?? 0) >>> 0),
      String((pet?.uBits ?? 0) >>> 0),
      String((pet?.eBits ?? 0) >>> 0),
      pet?.name ?? '',
      ...items.flatMap(({ defId, color }) => [
        String(defId),
        String(color >>> 0),
      ]),
    ]

    return PacketFactory.create<AvatarLookupOutgoing>(AvatarLookupOutgoing, {
      room,
      userName: player.username,
      uuid: player.uuid,
      status,
      body,
    })
  }
}
