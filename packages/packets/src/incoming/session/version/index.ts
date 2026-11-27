import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * The first packet
 * @class
 */
@Packet(Incoming.VersionCheck, 'xml')
export class VersionCheckIncoming extends IncomingPacket {
  /**
   * The plain version
   */
  @Field.string({ path: 'ver/@v' }) public readonly version: string = ''
}
