import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Where a buddy is
 * @class
 */
@Packet(Outgoing.BuddyWhere, 'xt')
export class BuddyWhereOutgoing extends OutgoingPacket {
  /**
   * Their room
   */
  @Field.string() public readonly roomName: string = ''

  /**
   * The room's name shown
   */
  @Field.string() public readonly displayName: string = ''

  /**
   * The room's name string id, or 0
   */
  @Field.int() public readonly displayNameId: number = 0

  /**
   * Whether the room is closed
   */
  @Field.int() public readonly locked: number = 0

  /**
   * Sends a buddy's location
   * @param room The target room
   * @param roomName Their room
   * @param displayName The room's name shown
   * @param displayNameId The room's name string id, or 0
   * @returns The packet
   */
  public static at(
    room: number,
    roomName: string,
    displayName: string,
    displayNameId: number,
  ): BuddyWhereOutgoing {
    return PacketFactory.create<BuddyWhereOutgoing>(BuddyWhereOutgoing, {
      room,
      roomName,
      displayName,
      displayNameId,
      locked: 0,
    })
  }

  /**
   * Says the buddy isn't playing
   * @param room The target room
   * @returns The packet
   */
  public static nowhere(room: number): BuddyWhereOutgoing {
    return BuddyWhereOutgoing.at(room, '', '', 0)
  }
}
