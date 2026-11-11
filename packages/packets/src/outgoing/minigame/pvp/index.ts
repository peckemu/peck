import { PvpAction } from '@peck/shared'

import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A two player game asked for or turned down
 * @class
 */
@Packet(Outgoing.MinigamePvp, 'xt')
export class MinigamePvpOutgoing extends OutgoingPacket {
  /**
   * The game
   */
  @Field.int() public readonly gameDefId: number = 0

  /**
   * Whether it is asked or turned down
   */
  @Field.int() public readonly action: number = PvpAction.Ask

  /**
   * Who asks
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Asks a player to a game
   * @param gameDefId The game
   * @param userName The player asking
   * @param nameVisible Whether their name can be shown
   * @returns The packet
   */
  public static invite(
    gameDefId: number,
    userName: string,
    nameVisible: boolean,
  ): MinigamePvpOutgoing {
    return PacketFactory.create<MinigamePvpOutgoing>(MinigamePvpOutgoing, {
      room: -1,
      gameDefId,
      action: PvpAction.Ask,
      body: [userName, nameVisible ? '1' : '0'],
    })
  }

  /**
   * Turns a game down
   * @param gameDefId The game
   * @returns The packet
   */
  public static refused(gameDefId: number): MinigamePvpOutgoing {
    return PacketFactory.create<MinigamePvpOutgoing>(MinigamePvpOutgoing, {
      room: -1,
      gameDefId,
      action: PvpAction.Refuse,
      body: [],
    })
  }
}
