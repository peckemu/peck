import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Marks adopt a pet cards seen
 * @class
 */
@Packet(Incoming.AdoptAPetsSeen, 'xt')
export class AdoptAPetsSeenIncoming extends IncomingPacket {
  /**
   * The cards' definition ids
   */
  @Field.rest(Field.int()) public readonly defIds: readonly number[] = []
}
