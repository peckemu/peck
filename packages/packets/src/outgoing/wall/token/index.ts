import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A wall's token
 * @class
 */
@Packet(Outgoing.WallToken, 'xt')
export class WallTokenOutgoing extends OutgoingPacket {
  /**
   * Whether there is a token
   */
  @Field.string() public readonly result: string = '1'

  /**
   * The token
   */
  @Field.string() public readonly token: string = ''

  /**
   * Whether the player can read
   */
  @Field.string() public readonly read: string = '1'

  /**
   * Whether the player can post
   */
  @Field.string() public readonly write: string = '0'

  /**
   * Whose wall
   */
  @Field.string() public readonly userName: string = ''

  /**
   * Gives a wall's token
   * @param room The room
   * @param token The token
   * @param write Whether the player may post
   * @param userName Whose wall
   * @returns The packet
   */
  public static given(
    room: number,
    token: string,
    write: boolean,
    userName: string,
  ): WallTokenOutgoing {
    return PacketFactory.create<WallTokenOutgoing>(WallTokenOutgoing, {
      room,
      result: '1',
      token,
      read: '1',
      write: write ? '1' : '0',
      userName,
    })
  }

  /**
   * Refuses a wall's token
   * @param room The room
   * @param userName Whose wall
   * @returns The packet
   */
  public static refused(room: number, userName: string): WallTokenOutgoing {
    return PacketFactory.create<WallTokenOutgoing>(WallTokenOutgoing, {
      room,
      result: '0',
      token: '',
      read: '0',
      write: '1',
      userName,
    })
  }
}
