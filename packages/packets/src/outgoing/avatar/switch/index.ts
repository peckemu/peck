import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { type AppearingAvatar } from '#packets/outgoing/avatar/joined'
import { Outgoing } from '#packets/outgoing/headers'
import { type ShownPet } from '#packets/outgoing/pet/list'

/**
 * The animal a player switched to
 */
export type SwitchedAvatar = AppearingAvatar & {
  /**
   * Its slot
   */
  readonly invId: number
}

/**
 * Someone switched animals
 * @class
 */
@Packet(Outgoing.AvatarSwitch, 'xt')
export class AvatarSwitchOutgoing extends OutgoingPacket {
  /**
   * Whether it was switched
   */
  @Field.int() public readonly success: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Tells the player they switched
   * @param room The room
   * @param userId The player in the room
   * @param avatar The animal
   * @param petInvId Its pet, or 0
   * @returns The packet
   */
  public static own(
    room: number,
    userId: number,
    avatar: SwitchedAvatar,
    petInvId: number,
  ): AvatarSwitchOutgoing {
    const body = [
      ...AvatarSwitchOutgoing.describe(userId, avatar),
      String(petInvId),
      String(avatar.questLevel),
    ]

    return PacketFactory.create<AvatarSwitchOutgoing>(AvatarSwitchOutgoing, {
      room,
      success: 1,
      body,
    })
  }

  /**
   * Tells the room someone switched
   * @param room The room
   * @param userId The player in the room
   * @param avatar The animal
   * @param pet Its pet, or null
   * @returns The packet
   */
  public static other(
    room: number,
    userId: number,
    avatar: SwitchedAvatar,
    pet: ShownPet | null,
  ): AvatarSwitchOutgoing {
    const shown = pet
      ? [
          String(pet.lBits >>> 0),
          String(pet.uBits >>> 0),
          String(pet.eBits >>> 0),
          pet.name,
          String(pet.createdTs),
          String(pet.personalityDefId),
          String(pet.favoriteFoodDefId),
          String(pet.favoriteToyDefId),
        ]
      : ['0', '0', '0', '', '0', '0', '0', '0']
    const body = [
      ...AvatarSwitchOutgoing.describe(userId, avatar),
      ...shown,
      String(avatar.questLevel),
    ]

    return PacketFactory.create<AvatarSwitchOutgoing>(AvatarSwitchOutgoing, {
      room,
      success: 1,
      body,
    })
  }

  /**
   * Says the switch was refused
   * @param room The room
   * @returns The packet
   */
  public static refused(room: number): AvatarSwitchOutgoing {
    return PacketFactory.create<AvatarSwitchOutgoing>(AvatarSwitchOutgoing, {
      room,
      success: 0,
      body: [],
    })
  }

  /**
   * Writes the player and the animal
   * @param userId The player in the room
   * @param avatar The animal
   * @returns The fields
   */
  private static describe(userId: number, avatar: SwitchedAvatar): string[] {
    const [color1, color2, color3] = avatar.colors

    return [
      String(userId),
      String(avatar.perUserId),
      String(avatar.invId),
      String(avatar.customId),
      String(avatar.typeId),
      String(color1 >>> 0),
      String(color2 >>> 0),
      String(color3 >>> 0),
      avatar.name,
    ]
  }
}
