import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * A player left an adventure
 * @class
 */
@Packet(Outgoing.QuestPlayerLeft, 'xt')
export class QuestPlayerLeftOutgoing extends OutgoingPacket {
  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Their animal's name
   */
  @Field.string() public readonly avatarName: string = ''

  /**
   * Says a player left
   * @param room The target room
   * @param userId The player's session id
   * @param avatarName Their animal's name
   * @returns The packet
   */
  public static of(
    room: number,
    userId: number,
    avatarName: string,
  ): QuestPlayerLeftOutgoing {
    return PacketFactory.create<QuestPlayerLeftOutgoing>(
      QuestPlayerLeftOutgoing,
      {
        room,
        userId,
        avatarName,
      },
    )
  }
}

/**
 * A player went to another adventure room
 * @class
 */
@Packet(Outgoing.QuestRoomChange, 'xt')
export class QuestRoomChangeOutgoing extends OutgoingPacket {
  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * The room
   */
  @Field.string() public readonly roomName: string = ''

  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0

  /**
   * Says a player changed rooms
   * @param room The target room
   * @param userId The player's session id
   * @param roomName The room
   * @param x Where across
   * @param y Where down
   * @returns The packet
   */
  public static of(
    room: number,
    userId: number,
    roomName: string,
    x: number,
    y: number,
  ): QuestRoomChangeOutgoing {
    return PacketFactory.create<QuestRoomChangeOutgoing>(
      QuestRoomChangeOutgoing,
      {
        room,
        userId,
        roomName,
        x,
        y,
      },
    )
  }
}

/**
 * A player moved in a side scrolling adventure
 * @class
 */
@Packet(Outgoing.QuestScroll, 'xt')
export class QuestScrollOutgoing extends OutgoingPacket {
  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0

  /**
   * The keys down and the move
   */
  @Field.int() public readonly flags: number = 0

  /**
   * Says where a player moved
   * @param room The target room
   * @param userId The player's session id
   * @param at Where
   * @param flags The keys down and the move
   * @returns The packet
   */
  public static of(
    room: number,
    userId: number,
    at: readonly [number, number],
    flags: number,
  ): QuestScrollOutgoing {
    return PacketFactory.create<QuestScrollOutgoing>(QuestScrollOutgoing, {
      room,
      userId,
      x: at[0],
      y: at[1],
      flags,
    })
  }
}

/**
 * A player is disguised
 * @class
 */
@Packet(Outgoing.QuestAvatarSwitch, 'xt')
export class QuestAvatarSwitchOutgoing extends OutgoingPacket {
  /**
   * The disguise, or -1
   */
  @Field.int() public readonly avatarRefId: number = -1

  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Disguises a player
   * @param room The target room
   * @param userId The player's session id
   * @param avatarRefId The disguise, or null
   * @returns The packet
   */
  public static of(
    room: number,
    userId: number,
    avatarRefId: number | null,
  ): QuestAvatarSwitchOutgoing {
    return PacketFactory.create<QuestAvatarSwitchOutgoing>(
      QuestAvatarSwitchOutgoing,
      {
        room,
        avatarRefId: avatarRefId ?? -1,
        userId,
      },
    )
  }
}
