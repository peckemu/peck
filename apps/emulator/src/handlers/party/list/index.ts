import { inject } from '@needle-di/core'
import { PartyCalendar, PartyCatalogue, RoomManager } from '@peck/game'
import { PartyListIncoming, PartyListOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Lists the parties on and coming
 * @class
 */
@Handler(PartyListIncoming)
export class PartyListHandler extends PacketHandler<PartyListIncoming> {
  /**
   * Every party
   */
  private readonly parties = inject<PartyCatalogue>(PartyCatalogue)

  /**
   * When the parties are on
   */
  private readonly calendar = inject<PartyCalendar>(PartyCalendar)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Sends the parties the client knows
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: PartyListIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const listed = this.calendar.listing(Date.now(), (defId) => {
      const party = this.parties.get(defId)
      if (!party || party.isCustom) return false

      return party.isGame || this.rooms.byDefId(party.roomDefId) !== null
    })

    await context.session.send<PartyListOutgoing>(
      PartyListOutgoing.of(packet.room, listed),
    )
  }
}
