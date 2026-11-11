import { ChatKind } from '@peck/shared'

import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Someone in the room spoke
 * @class
 */
@Packet(Outgoing.RoomChat, 'xt')
export class RoomChatOutgoing extends OutgoingPacket {
  /**
   * The SmartFox user id of the speaker
   */
  @Field.int() public readonly userId: number = 0

  /**
   * What they said
   */
  @Field.string() public readonly text: string = ''

  /**
   * How the message was made
   */
  @Field.enum(ChatKind) public readonly kind: ChatKind = ChatKind.Free

  /**
   * How the balloon shows it
   */
  @Field.int({ default: 0 }) public readonly level?: number

  /**
   * Shows a two player game over a player's head
   * @param room The player's room
   * @param userId Their session id
   * @param hosting Whether they host it
   * @param gameDefId The game, or 0
   * @returns The packet
   */
  public static hostedGame(
    room: number,
    userId: number,
    hosting: boolean,
    gameDefId: number,
  ): RoomChatOutgoing {
    return PacketFactory.create<RoomChatOutgoing>(RoomChatOutgoing, {
      room,
      userId,
      text: RoomChatOutgoing.hosting(hosting, gameDefId),
      kind: ChatKind.CustomPvp,
      level: 0,
    })
  }

  /**
   * Writes a hosted game
   * @param hosting Whether it is hosted
   * @param gameDefId The game, or 0
   * @returns The text
   */
  public static hosting(hosting: boolean, gameDefId: number): string {
    return `${hosting ? 'on' : 'off'}|${String(gameDefId)}`
  }
}
