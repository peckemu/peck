import { RandomKeyIncoming, RandomKeyOutgoing } from '@peck/packets'
import { Guest, Handler, PacketHandler, Public } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Hands out the login key
 * @class
 */
@Public()
@Guest()
@Handler(RandomKeyIncoming)
export class RandomKeyHandler extends PacketHandler<RandomKeyIncoming> {
  /**
   * Sends a login key
   * @param _packet The key request
   * @param context The packet context
   */
  public async handle(
    _packet: RandomKeyIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const key = crypto.randomUUID().replaceAll('-', '')
    context.session.randomKey = key
    await context.reply(RandomKeyOutgoing, { key })
  }
}
