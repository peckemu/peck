import { inject } from '@needle-di/core'
import { ShopRepository } from '@peck/database'
import {
  GenericListCatalogue,
  HostedParties,
  PartyCatalogue,
  type Player,
  RoomManager,
} from '@peck/game'
import {
  CurrencyOutgoing,
  HostRefusal,
  PartyHostIncoming,
  PartyHostOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { RoomJoinType } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PartyVenues } from '#emulator/handlers/party/venue'

/**
 * The party price in diamonds
 */
const COST = 1

/**
 * How long a hosted party lasts
 */
const LASTS = 30 * 60 * 1000

/**
 * The diamonds currency
 */
const DIAMONDS = 3

/**
 * The name wheels
 */
const NAME_LISTS = [386, 387, 388] as const

/**
 * The songs a party can play
 */
const SONG_LIST = 401

/**
 * Hosts parties
 * @class
 */
@Throttle({ limit: 3, per: 30_000 })
@Handler(PartyHostIncoming)
export class PartyHostHandler extends PacketHandler<PartyHostIncoming> {
  /**
   * Every party
   */
  private readonly parties = inject<PartyCatalogue>(PartyCatalogue)

  /**
   * Every generic list
   */
  private readonly lists = inject<GenericListCatalogue>(GenericListCatalogue)

  /**
   * The parties players host
   */
  private readonly hosted = inject<HostedParties>(HostedParties)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Pays for parties
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * Puts players in party rooms
   */
  private readonly venues = inject<PartyVenues>(PartyVenues)

  /**
   * Hosts a party
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: PartyHostIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const now = Date.now()

    const refusal = this.refusal(player, packet, now)
    if (refusal !== null) {
      return session.send<PartyHostOutgoing>(
        PartyHostOutgoing.refused(packet.room, refusal),
      )
    }

    const diamonds = await this.shops.payForParty(player.gameId, COST)
    if (diamonds === null) {
      return session.send<PartyHostOutgoing>(
        PartyHostOutgoing.refused(packet.room, HostRefusal.Diamonds),
      )
    }
    player.wallet.set('diamonds', diamonds)

    const roomName = `pparty${player.username}`
    const party = this.parties.get(packet.defId)
    const template = party
      ? this.rooms.hostParty(roomName, party.roomDefId, {
          defId: party.defId,
          song: packet.songDefId,
        })
      : null
    if (!template) {
      return session.send<PartyHostOutgoing>(
        PartyHostOutgoing.refused(packet.room, HostRefusal.Refused),
      )
    }

    this.hosted.host({
      hostGameId: player.gameId,
      hostUuid: player.uuid,
      hostName: player.username,
      defId: packet.defId,
      name: [packet.firstNameId, packet.middleNameId, packet.lastNameId].join(
        '|',
      ),
      song: packet.songDefId,
      roomName,
      endsAt: now + LASTS,
    })

    await session.send<PartyHostOutgoing>(
      PartyHostOutgoing.hosted(packet.room, LASTS / 1000),
    )
    await session.send<CurrencyOutgoing>(
      CurrencyOutgoing.of(DIAMONDS, diamonds),
    )

    const from = player.roomId
    const placement = this.rooms.join(player, roomName, RoomJoinType.Auto)
    if (placement.room) await this.venues.enter(session, placement.room, from)
  }

  /**
   * Finds why a party can't be hosted
   * @param player The player
   * @param packet The packet
   * @param now The time now
   * @returns The reason, or null
   */
  private refusal(
    player: Player,
    packet: PartyHostIncoming,
    now: number,
  ): HostRefusal | null {
    if (!player.member) return HostRefusal.Members
    if (this.hosted.of(player.gameId, now)) return HostRefusal.Hosting

    const party = this.parties.get(packet.defId)
    if (!party?.isCustom || !this.rooms.byDefId(party.roomDefId)) {
      return HostRefusal.Invalid
    }

    const songs = this.lists.get(SONG_LIST)?.ids ?? []
    if (songs.length > 0 && !songs.includes(packet.songDefId)) {
      return HostRefusal.Invalid
    }

    const names = NAME_LISTS.flatMap(
      (listId) => this.lists.get(listId)?.ids ?? [],
    )
    const parts = [packet.firstNameId, packet.middleNameId, packet.lastNameId]
    if (
      parts.some(
        (part) => part < 0 || (names.length > 0 && !names.includes(part)),
      )
    ) {
      return HostRefusal.Invalid
    }

    return null
  }
}
