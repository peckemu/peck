import { inject } from '@needle-di/core'
import { HostedParties, RoomManager } from '@peck/game'
import { HostedPartyJoinIncoming, HostedPartyJoinOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'
import { RoomJoinType } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PartyVenues } from '#emulator/handlers/party/venue'

/**
 * Goes to a party a player hosts
 * @class
 */
@Handler(HostedPartyJoinIncoming)
export class HostedPartyJoinHandler extends PacketHandler<HostedPartyJoinIncoming> {
  /**
   * The parties players host
   */
  private readonly hosted = inject<HostedParties>(HostedParties)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Puts players in party rooms
   */
  private readonly venues = inject<PartyVenues>(PartyVenues)

  /**
   * Sends them to the party
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: HostedPartyJoinIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const party = this.hosted.byUuid(packet.hostUuid, Date.now())
    if (!party) {
      return session.send<HostedPartyJoinOutgoing>(
        HostedPartyJoinOutgoing.refused(packet.room, 'NPP'),
      )
    }

    const blocked =
      player.buddies.blocks(party.hostName) ||
      player.buddies.blockedBy.has(party.hostGameId)
    if (blocked) {
      return session.send<HostedPartyJoinOutgoing>(
        HostedPartyJoinOutgoing.refused(packet.room, 'BLK'),
      )
    }

    const from = player.roomId
    const placement = this.rooms.join(player, party.roomName, RoomJoinType.Auto)
    if (!placement.room) {
      return session.send<HostedPartyJoinOutgoing>(
        HostedPartyJoinOutgoing.refused(packet.room, 'DIS'),
      )
    }

    await session.send<HostedPartyJoinOutgoing>(
      HostedPartyJoinOutgoing.joined(packet.room),
    )
    await this.venues.enter(session, placement.room, from)
  }
}
