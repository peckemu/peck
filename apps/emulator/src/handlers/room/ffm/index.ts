import { inject } from '@needle-di/core'
import { RoomManager } from '@peck/game'
import {
  FirstFiveMinutesIncoming,
  FirstFiveMinutesOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The first five minutes room prefix
 */
const PREFIX = 'ffm'

/**
 * Says whether the first five minutes room is ready
 * @class
 */
@Throttle({ limit: 3, per: 10_000 })
@Handler(FirstFiveMinutesIncoming)
export class FirstFiveMinutesHandler extends PacketHandler<FirstFiveMinutesIncoming> {
  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Finds the player's tour room
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: FirstFiveMinutesIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const name = `${PREFIX}${player.username}`
    const ready = player.avatar !== null && this.rooms.template(name) !== null
    if (!ready) context.log.info({ room: name }, 'no first five minutes room')

    await session.send<FirstFiveMinutesOutgoing>(
      FirstFiveMinutesOutgoing.of(packet.room, ready),
    )
  }
}
