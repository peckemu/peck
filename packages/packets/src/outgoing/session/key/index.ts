import { Field, OutgoingPacket, Packet } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The login key
 * @class
 */
@Packet(Outgoing.RandomKey, 'xml', { room: -1 })
export class RandomKeyOutgoing extends OutgoingPacket {
  /**
   * The random key
   */
  @Field.string({ path: 'k' }) public readonly key: string = ''
}
