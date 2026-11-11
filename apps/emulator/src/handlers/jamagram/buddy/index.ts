import { JamagramBuddyIncoming, JamagramBuddyOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Answers a buddy request card
 * @class
 */
@Handler(JamagramBuddyIncoming)
export class JamagramBuddyHandler extends PacketHandler<JamagramBuddyIncoming> {
  /**
   * Says it can't be done
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: JamagramBuddyIncoming,
    context: HandlerContext,
  ): Promise<void> {
    await context.reply<JamagramBuddyOutgoing>(JamagramBuddyOutgoing, {
      room: packet.room,
      result: -1,
    })
  }
}
