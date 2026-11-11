import { inject } from '@needle-di/core'
import {
  AvatarCatalogue,
  PartyCalendar,
  PartyCatalogue,
  PartyRestriction,
  type PartyTemplate,
  type Player,
  RoomManager,
  type RoomTemplate,
} from '@peck/game'
import {
  PartyJoinIncoming,
  PartyJoinOutgoing,
  PartyRefusal,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { RoomJoinType } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PartyVenues } from '#emulator/handlers/party/venue'

/**
 * An animal's worlds
 */
const WORLD = { land: 1, ocean: 2 } as const

/**
 * Goes to a party
 * @class
 */
@Throttle({ limit: 6, per: 6_000 })
@Handler(PartyJoinIncoming)
export class PartyJoinHandler extends PacketHandler<PartyJoinIncoming> {
  /**
   * Every party
   */
  private readonly parties = inject<PartyCatalogue>(PartyCatalogue)

  /**
   * When the parties are on
   */
  private readonly calendar = inject<PartyCalendar>(PartyCalendar)

  /**
   * Every animal
   */
  private readonly animals = inject<AvatarCatalogue>(AvatarCatalogue)

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
    packet: PartyJoinIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const party = this.parties.get(packet.defId)
    const venue =
      party && !party.isCustom && !party.isGame
        ? this.rooms.byDefId(party.roomDefId)
        : null

    const refusal = this.refusal(player, party, venue)
    if (refusal !== null || !venue) {
      context.log.info({ defId: packet.defId, refusal }, 'party refused')
      return session.send<PartyJoinOutgoing>(
        PartyJoinOutgoing.refused(
          packet.room,
          refusal ?? PartyRefusal.Ended,
          packet.defId,
        ),
      )
    }

    const from = player.roomId
    const wanted = player.room?.number
    const placement = this.rooms.join(
      player,
      wanted === undefined ? venue.name : `${venue.name}#${String(wanted)}`,
      RoomJoinType.Auto,
    )
    if (!placement.room) return

    await this.venues.enter(session, placement.room, from)
  }

  /**
   * Checks a player can join a party
   * @param player The player
   * @param party The party
   * @param venue The venue
   * @returns The reason, or null
   */
  private refusal(
    player: Player,
    party: PartyTemplate | null,
    venue: RoomTemplate | null,
  ): PartyRefusal | null {
    const { avatar } = player
    if (!party || !venue || !avatar) return PartyRefusal.Ended

    const on = this.calendar.onNow(party.defId, Date.now())
    if (!on) return PartyRefusal.Ended
    if (on.entry.membersOnly && !player.member) return PartyRefusal.Members

    if (!PartyCatalogue.allows(party, avatar.typeId)) return PartyRefusal.Animal

    const ocean = venue.enviroType === 1
    const flags =
      this.animals.get(avatar.typeId)?.enviroTypeFlags ??
      WORLD.land | WORLD.ocean
    if ((flags & (ocean ? WORLD.ocean : WORLD.land)) === 0) {
      return PartyRefusal.Animal
    }

    const needsPet =
      (party.restrictions &
        (PartyRestriction.Pets | PartyRestriction.PetsOnly)) !==
      0
    if (needsPet && !player.petOut(ocean)) return PartyRefusal.Pet

    return null
  }
}
