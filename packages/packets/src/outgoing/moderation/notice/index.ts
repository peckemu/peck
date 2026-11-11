import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A staff action notice
 * @class
 */
@Packet(Outgoing.ModerationNotice, 'xt')
export class ModerationNoticeOutgoing extends OutgoingPacket {
  /**
   * What staff did
   */
  @Field.string() public readonly action: string = ''

  /**
   * Its details
   */
  @Field.rest(Field.int()) public readonly details: readonly number[] = []

  /**
   * Tells of a ban
   * @param room The target room
   * @param seconds The seconds left, or -1
   * @returns The packet
   */
  public static banned(
    room: number,
    seconds: number,
  ): ModerationNoticeOutgoing {
    return ModerationNoticeOutgoing.of(room, 'fb', [1, seconds])
  }

  /**
   * Tells of a silence
   * @param room The target room
   * @param minutes The minutes left, or -1
   * @returns The packet
   */
  public static silenced(
    room: number,
    minutes: number,
  ): ModerationNoticeOutgoing {
    return ModerationNoticeOutgoing.of(room, 'fs', [minutes])
  }

  /**
   * Tells of a lifted silence
   * @param room The target room
   * @returns The packet
   */
  public static unsilenced(room: number): ModerationNoticeOutgoing {
    return ModerationNoticeOutgoing.of(room, 'fs', [0])
  }

  /**
   * Tells of a kick
   * @param room The target room
   * @returns The packet
   */
  public static kicked(room: number): ModerationNoticeOutgoing {
    return ModerationNoticeOutgoing.of(room, 'fk', [0])
  }

  /**
   * Builds a notice
   * @param room The target room
   * @param action What staff did
   * @param details Its details
   * @returns The packet
   */
  private static of(
    room: number,
    action: string,
    details: readonly number[],
  ): ModerationNoticeOutgoing {
    return PacketFactory.create<ModerationNoticeOutgoing>(
      ModerationNoticeOutgoing,
      { room, action, details },
    )
  }
}
