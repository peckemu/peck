import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The epic dens
 * @class
 */
@Packet(Outgoing.DenEpic, 'xt')
export class DenEpicOutgoing extends OutgoingPacket {
  /**
   * The dens' owners
   */
  @Field.list(Field.string()) public readonly userNames: readonly string[] = []

  /**
   * Lists the epic dens
   * @param room The target room
   * @param userNames The dens' owners
   * @returns The packet
   */
  public static of(
    room: number,
    userNames: readonly string[],
  ): DenEpicOutgoing {
    return PacketFactory.create<DenEpicOutgoing>(DenEpicOutgoing, {
      room,
      userNames,
    })
  }
}
