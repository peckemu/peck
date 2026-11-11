import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { type AppearingAvatar } from '#packets/outgoing/avatar/joined'
import { Outgoing } from '#packets/outgoing/headers'
import { type ShownPet } from '#packets/outgoing/pet/list'

/**
 * The player an avatar belongs to
 */
export type AvatarOwner = {
  readonly username: string
  readonly uuid: string
  readonly nameBarData: number
}

/**
 * One of a player's avatars
 * @class
 */
@Packet(Outgoing.AvatarData, 'xt')
export class AvatarDataOutgoing extends OutgoingPacket {
  /**
   * The player's username
   */
  @Field.string() public readonly userName: string = ''

  /**
   * The player's uuid
   */
  @Field.string() public readonly uuid: string = ''

  /**
   * The player's name bar
   */
  @Field.int() public readonly nameBar: number = 0

  /**
   * Land 0 or ocean 1
   */
  @Field.int() public readonly enviroType: number = 0

  /**
   * Whether the username can be shown
   */
  @Field.int() public readonly userNameModerated: number = 1

  /**
   * Seconds left hosting a party
   */
  @Field.int() public readonly partyTime: number = 0

  /**
   * Days since the player last logged in
   */
  @Field.int() public readonly daysSinceLastLogin: number = 0

  /**
   * Its id among the player's avatars
   */
  @Field.int() public readonly perUserAvId: number = 0

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
   * Its name
   */
  @Field.string() public readonly avName: string = ''

  /**
   * Its adventure level
   */
  @Field.int() public readonly questLevel: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Describes one of the player's own avatars
   * @param owner The player
   * @param avatar The avatar
   * @param slot Its slot
   * @param landPetInvIdx The land pet, or 0
   * @param oceanPetInvIdx The ocean pet, or 0
   * @returns The packet
   */
  public static own(
    owner: AvatarOwner,
    avatar: AppearingAvatar,
    slot: number,
    landPetInvIdx = 0,
    oceanPetInvIdx = 0,
  ): AvatarDataOutgoing {
    const body = [slot, landPetInvIdx, oceanPetInvIdx, 0, 0, 0, 0, 0].map(
      String,
    )

    return AvatarDataOutgoing.build(-1, owner, avatar, body)
  }

  /**
   * Describes someone else's avatar
   * @param room The target room
   * @param owner The player
   * @param avatar The avatar
   * @param pet Its pet, or null
   * @returns The packet
   */
  public static other(
    room: number,
    owner: AvatarOwner,
    avatar: AppearingAvatar,
    pet: ShownPet | null = null,
  ): AvatarDataOutgoing {
    const body = pet
      ? [
          String(pet.lBits >>> 0),
          String(pet.uBits >>> 0),
          String(pet.eBits >>> 0),
          pet.name,
        ]
      : ['0', '0', '0', '']

    return AvatarDataOutgoing.build(room, owner, avatar, body)
  }

  /**
   * Builds the packet
   * @param room The target room
   * @param owner The player
   * @param avatar The avatar
   * @param body The rest
   * @returns The packet
   */
  private static build(
    room: number,
    owner: AvatarOwner,
    avatar: AppearingAvatar,
    body: readonly string[],
  ): AvatarDataOutgoing {
    const [color1, color2, color3] = avatar.colors

    return PacketFactory.create<AvatarDataOutgoing>(AvatarDataOutgoing, {
      room,
      userName: owner.username,
      uuid: owner.uuid,
      nameBar: owner.nameBarData,
      enviroType: 0,
      userNameModerated: 1,
      partyTime: 0,
      daysSinceLastLogin: 0,
      perUserAvId: avatar.perUserId,
      avTypeId: avatar.typeId,
      customAvId: avatar.customId,
      color1,
      color2,
      color3,
      avName: avatar.name,
      questLevel: avatar.questLevel,
      body,
    })
  }
}
