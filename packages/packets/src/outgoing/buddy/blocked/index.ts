import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a player blocks this one
 * @class
 */
@Packet(Outgoing.BlockInfo, 'xt')
export class BlockInfoOutgoing extends OutgoingPacket {
  /**
   * The other player's username
   */
  @Field.string() public readonly userName: string = ''

  /**
   * Whether they do
   */
  @Field.int() public readonly result: number = 0

  /**
   * Says whether they block this player
   * @param room The target room
   * @param userName The other player's username
   * @param result Whether they do
   * @returns The packet
   */
  public static of(
    room: number,
    userName: string,
    result: boolean,
  ): BlockInfoOutgoing {
    return PacketFactory.create<BlockInfoOutgoing>(BlockInfoOutgoing, {
      room,
      userName,
      result: result ? 1 : 0,
    })
  }
}
