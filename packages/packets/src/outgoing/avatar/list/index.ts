import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * One of the player's own avatars
 */
export type ListedAvatar = {
  /**
   * Its id among the player's avatars
   */
  readonly perUserAvId: number

  /**
   * Its slot
   */
  readonly avInvId: number

  /**
   * Its name
   */
  readonly avName: string

  /**
   * The animal it is
   */
  readonly avTypeId: number

  /**
   * The custom animal, or -1
   */
  readonly customAvId: number
}

/**
 * The player's own avatar list
 */
export type OwnAvatars = {
  /**
   * The player's username
   */
  readonly userName: string

  /**
   * Which avatar slots they can use
   */
  readonly slotFlags: number

  /**
   * The player's uuid
   */
  readonly uuid: string

  /**
   * Their avatars
   */
  readonly avatars: readonly ListedAvatar[]
}

/**
 * A player's avatars
 * @class
 */
@Packet(Outgoing.AvatarList, 'xt')
export class AvatarListOutgoing extends OutgoingPacket {
  /**
   * Whose avatars
   */
  @Field.string() public readonly userName: string = ''

  /**
   * The list
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists the player's own avatars
   * @param room The target room
   * @param own The player's avatars
   * @returns The packet
   */
  public static own(room: number, own: OwnAvatars): AvatarListOutgoing {
    const avatars = own.avatars.flatMap((avatar) => [
      String(avatar.perUserAvId),
      String(avatar.avInvId),
      avatar.avName,
      String(avatar.avTypeId),
      String(avatar.customAvId),
    ])

    return PacketFactory.create<AvatarListOutgoing>(AvatarListOutgoing, {
      room,
      userName: own.userName,
      body: [
        String(own.slotFlags >>> 0),
        own.uuid,
        String(own.avatars.length),
        ...avatars,
      ],
    })
  }

  /**
   * Lists someone else's avatars
   * @param room The target room
   * @param userName Whose avatars
   * @param perUserAvIds Their avatar ids
   * @returns The packet
   */
  public static others(
    room: number,
    userName: string,
    perUserAvIds: readonly number[],
  ): AvatarListOutgoing {
    return PacketFactory.create<AvatarListOutgoing>(AvatarListOutgoing, {
      room,
      userName,
      body: [String(perUserAvIds.length), ...perUserAvIds.map(String)],
    })
  }
}
