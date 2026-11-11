import { inject, injectable } from '@needle-di/core'
import {
  HostedParties,
  PartyCalendar,
  PartyCatalogue,
  type Room,
  type RoomTemplate,
} from '@peck/game'
import { RoomJoinOutgoing, RoomPropertiesOutgoing } from '@peck/packets'

import { SessionManager } from '#emulator/sessions/manager'
import { type Session } from '#emulator/sessions/session'

/**
 * Finds the party rooms
 * @class
 */
@injectable()
export class PartyVenues {
  /**
   * Every party
   */
  private readonly parties = inject<PartyCatalogue>(PartyCatalogue)

  /**
   * When the parties are on
   */
  private readonly calendar = inject<PartyCalendar>(PartyCalendar)

  /**
   * The parties players host
   */
  private readonly hosted = inject<HostedParties>(HostedParties)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Finds the party a room holds now
   * @param template The room
   * @returns The party, or 0
   */
  public partyAt(template: RoomTemplate): number {
    if (template.party) return template.party.defId

    const now = Date.now()
    for (const party of this.parties) {
      const held =
        !party.isCustom && !party.isGame && party.roomDefId === template.defId
      if (held && this.calendar.onNow(party.defId, now)) return party.defId
    }

    return 0
  }

  /**
   * Checks a hosted party is live
   * @param template The room
   * @returns Whether it is
   */
  public stillOn(template: RoomTemplate): boolean {
    return (
      !template.party || this.hosted.byRoom(template.name, Date.now()) !== null
    )
  }

  /**
   * Sends a player into their room
   * @param session The player's session
   * @param room The room
   * @param from Their old room, or -1
   */
  public async enter(
    session: Session,
    room: Room,
    from: number,
  ): Promise<void> {
    const { player } = session
    const avatar = player?.avatar
    if (!player || !avatar) return

    await this.sessions.arrive(session, from)

    await session.send<RoomJoinOutgoing>(
      RoomJoinOutgoing.joinedRoom({
        name: room.name,
        id: room.id,
        users: room.size,
        capacity: room.capacity,
        displayName: room.template.sentName,
        displayNameId: room.template.nameId,
        perUserAvId: avatar.perUserId,
        activePetInvId:
          player.petOut(room.template.enviroType === 1)?.invId ?? 0,
        song: room.template.party?.song ?? 0,
      }),
    )
    await session.send<RoomPropertiesOutgoing>(
      RoomPropertiesOutgoing.of(
        room.id,
        room.template,
        this.partyAt(room.template),
      ),
    )
    await this.sessions.introduce(session)
  }
}
