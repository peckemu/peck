import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Saves the den editor's changes
 * @class
 */
@Packet(Incoming.DenStateSave, 'xt')
export class DenStateSaveIncoming extends IncomingPacket {
  /**
   * How many changes follow
   */
  @Field.int() public readonly count: number = 0

  /**
   * The changes
   */
  @Field.rest() public readonly changes: readonly string[] = []
}
