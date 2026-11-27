import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * Someone came into or left the player's den
 * @class
 */
@Packet(Outgoing.DenVisitors, 'xt')
export class DenVisitorsOutgoing extends OutgoingPacket {
  /**
   * How many are in the den
   */
  @Field.int() public readonly count: number = 0

  /**
   * Whether they came in
   */
  @Field.bool() public readonly entering: boolean = false

  /**
   * Who came in or left
   */
  @Field.string() public readonly username: string = ''

  /**
   * Says someone came into the den
   * @param count How many are in the den
   * @param username Who came in
   * @returns The packet
   */
  public static entered(count: number, username: string): DenVisitorsOutgoing {
    return PacketFactory.create<DenVisitorsOutgoing>(DenVisitorsOutgoing, {
      room: -1,
      count,
      entering: true,
      username,
    })
  }

  /**
   * Says someone left the den
   * @param count How many are in the den
   * @param username Who left
   * @returns The packet
   */
  public static left(count: number, username: string): DenVisitorsOutgoing {
    return PacketFactory.create<DenVisitorsOutgoing>(DenVisitorsOutgoing, {
      room: -1,
      count,
      entering: false,
      username,
    })
  }
}
