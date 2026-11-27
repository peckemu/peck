import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * An adventure was left
 * @class
 */
@Packet(Outgoing.QuestExit, 'xt')
export class QuestExitOutgoing extends OutgoingPacket {
  /**
   * Says the adventure was left
   * @param room The target room
   * @returns The packet
   */
  public static of(room: number): QuestExitOutgoing {
    return PacketFactory.create<QuestExitOutgoing>(QuestExitOutgoing, { room })
  }
}

/**
 * Sends a player out of an adventure
 * @class
 */
@Packet(Outgoing.QuestExitType, 'xt')
export class QuestExitTypeOutgoing extends OutgoingPacket {
  /**
   * How the player is sent out
   */
  @Field.string() public readonly exitType: string = ''

  /**
   * Sends the player out
   * @param room The target room
   * @param exitType How
   * @returns The packet
   */
  public static of(room: number, exitType: string): QuestExitTypeOutgoing {
    return PacketFactory.create<QuestExitTypeOutgoing>(QuestExitTypeOutgoing, {
      room,
      exitType,
    })
  }
}
