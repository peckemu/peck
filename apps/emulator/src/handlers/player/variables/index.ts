import { UserVariablesIncoming, UserVariablesOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Lists the player's user variables
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(UserVariablesIncoming)
export class UserVariablesHandler extends PacketHandler<UserVariablesIncoming> {
  /**
   * Sends the variables
   * @param _packet The packet
   * @param context The packet context
   */
  public async handle(
    _packet: UserVariablesIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    await session.send<UserVariablesOutgoing>(
      UserVariablesOutgoing.of([...player.variables.values()]),
    )
  }
}
