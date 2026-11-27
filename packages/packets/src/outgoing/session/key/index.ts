import { Field, OutgoingPacket, Packet } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

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
