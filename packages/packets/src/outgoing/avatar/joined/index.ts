import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { RoomChatOutgoing } from '#packets/outgoing/chat/room'
import { Outgoing } from '#packets/outgoing/headers'
import { type ShownPet } from '#packets/outgoing/pet/list'

/**
 * A player appearing in a room
 */
export type AppearingPlayer = {
  readonly id: number
  readonly username: string
  readonly uuid: string
  readonly accountType: number
  readonly nameBarData: number
  readonly position: { readonly x: number; readonly y: number }
  readonly animation: number
  readonly hostedGame?: number | null
}

/**
 * A player's avatar
 */
export type AppearingAvatar = {
  readonly perUserId: number
  readonly name: string
  readonly typeId: number
  readonly customId: number
  readonly colors: readonly [number, number, number]
  readonly questLevel: number
}

/**
 * The avatar details
 */
const PLAIN = 3

/**
 * The pet details bit
 */
const PET = 1 << 2

/**
 * The hosted game bit
 */
const HOSTED_GAME = 1 << 10

/**
 * An avatar appears in the room
 * @class
 */
@Packet(Outgoing.AvatarJoined, 'xt')
export class AvatarJoinedOutgoing extends OutgoingPacket {
  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Where it stands across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where it stands down
   */
  @Field.int() public readonly y: number = 0

  /**
   * Its idle animation
   */
  @Field.uint() public readonly animation: number = 0

  /**
   * The player's username
   */
  @Field.string() public readonly userName: string = ''

  /**
   * The player's uuid
   */
  @Field.string() public readonly uuid: string = ''

  /**
   * Its id among the player's avatars
   */
  @Field.int() public readonly perUserAvId: number = 0

  /**
   * Its name
   */
  @Field.string() public readonly avName: string = ''

  /**
   * The animal it is
   */
  @Field.int() public readonly avTypeId: number = 0

  /**
   * The custom animal, or -1
   */
  @Field.int() public readonly customAvId: number = -1

  /**
   * Its first colour
   */
  @Field.uint() public readonly color1: number = 0

  /**
   * Its second colour
   */
  @Field.uint() public readonly color2: number = 0

  /**
   * Its third colour
   */
  @Field.uint() public readonly color3: number = 0

  /**
   * Its adventure level
   */
  @Field.int() public readonly questLevel: number = 0

  /**
   * Whether the username can be shown
   */
  @Field.int() public readonly userNameModerated: number = 1

  /**
   * Days since the player last logged in
   */
  @Field.int() public readonly daysSinceLastLogin: number = 0

  /**
   * Which details follow
   */
  @Field.int() public readonly details: number = 3

  /**
   * The player's account type
   */
  @Field.int() public readonly accountType: number = 0

  /**
   * The player's name bar
   */
  @Field.int() public readonly nameBar: number = 0

  /**
   * Its pet and hosted game
   */
  @Field.rest() public readonly optional: readonly string[] = []

  /**
   * Shows a player in a room
   * @param room The target room
   * @param player The player
   * @param avatar Their avatar
   * @param pet Its pet, or null
   * @returns The packet
   */
  public static of(
    room: number,
    player: AppearingPlayer,
    avatar: AppearingAvatar,
    pet: ShownPet | null = null,
  ): AvatarJoinedOutgoing {
    const [color1, color2, color3] = avatar.colors
    const hosted = player.hostedGame ?? null
    const details =
      PLAIN | (pet ? PET : 0) | (hosted === null ? 0 : HOSTED_GAME)

    return PacketFactory.create<AvatarJoinedOutgoing>(AvatarJoinedOutgoing, {
      room,
      userId: player.id,
      x: player.position.x,
      y: player.position.y,
      animation: player.animation,
      userName: player.username,
      uuid: player.uuid,
      perUserAvId: avatar.perUserId,
      avName: avatar.name,
      avTypeId: avatar.typeId,
      customAvId: avatar.customId,
      color1,
      color2,
      color3,
      questLevel: avatar.questLevel,
      userNameModerated: 1,
      daysSinceLastLogin: 0,
      details,
      accountType: player.accountType,
      nameBar: player.nameBarData,
      optional: [
        ...(pet
          ? [
              String(pet.lBits >>> 0),
              String(pet.uBits >>> 0),
              String(pet.eBits >>> 0),
              pet.name,
              String(pet.createdTs),
              String(pet.personalityDefId),
              String(pet.favoriteToyDefId),
              String(pet.favoriteFoodDefId),
            ]
          : []),
        ...(hosted === null ? [] : [RoomChatOutgoing.hosting(true, hosted)]),
      ],
    })
  }
}
