import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Leaves a game inside the room
 * @class
 */
@Packet(Incoming.RoomLeave, 'xt')
export class RoomLeaveIncoming extends IncomingPacket {
  /**
   * The game's room
   */
  @Field.int() public readonly roomId: number = 0
}
