import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether the first five minutes room is ready
 * @class
 */
@Packet(Outgoing.FirstFiveMinutes, 'xt')
export class FirstFiveMinutesOutgoing extends OutgoingPacket {
  /**
   * Whether it is ready
   */
  @Field.int() public readonly ready: number = 0

  /**
   * Says whether the room is ready
   * @param room The target room
   * @param ready Whether it is ready
   * @returns The packet
   */
  public static of(room: number, ready: boolean): FirstFiveMinutesOutgoing {
    return PacketFactory.create<FirstFiveMinutesOutgoing>(
      FirstFiveMinutesOutgoing,
      { room, ready: ready ? 1 : 0 },
    )
  }
}
