import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a player was unblocked
 * @class
 */
@Packet(Outgoing.Unblock, 'xt')
export class UnblockOutgoing extends OutgoingPacket {
  /**
   * The other player's username
   */
  @Field.string() public readonly userName: string = ''

  /**
   * Whether it worked
   */
  @Field.int() public readonly result: number = 0

  /**
   * Says whether the unblock worked
   * @param room The target room
   * @param userName The other player's username
   * @param result Whether it worked
   * @returns The packet
   */
  public static of(
    room: number,
    userName: string,
    result: boolean,
  ): UnblockOutgoing {
    return PacketFactory.create<UnblockOutgoing>(UnblockOutgoing, {
      room,
      userName,
      result: result ? 1 : 0,
    })
  }
}
