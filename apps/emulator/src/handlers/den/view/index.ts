import { inject, injectable } from '@needle-di/core'
import {
  DenItemCatalogue,
  type Player,
  type Room,
  RoomManager,
} from '@peck/game'
import {
  DenStateOutgoing,
  type PlacedDenItem,
  RoomJoinOutgoing,
  RoomPropertiesOutgoing,
} from '@peck/packets'
import { RoomJoinType } from '@peck/shared'

import { type Config } from '#emulator/config'
import { PartyVenues } from '#emulator/handlers/party/venue'
import { SessionManager } from '#emulator/sessions/manager'
import { type Session } from '#emulator/sessions/session'
import { ConfigToken } from '#emulator/tokens'

/**
 * Shows players a den
 * @class
 */
@injectable()
export class DenView {
  /**
   * The emulator config
   */
  private readonly config = inject<Config>(ConfigToken)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Puts players in rooms
   */
  private readonly venues = inject<PartyVenues>(PartyVenues)

  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * Shows a player the den they are in
   * @param session The player's session
   * @param owner The den's owner
   * @param room The den
   */
  public async show(
    session: Session,
    owner: Player,
    room: Room,
  ): Promise<void> {
    const { player } = session
    const avatar = player?.avatar
    const { den } = room.template
    if (!player || !avatar || !den) return

    await session.send<RoomJoinOutgoing>(
      RoomJoinOutgoing.joinedRoom({
        name: room.name,
        id: room.id,
        users: room.size,
        capacity: room.capacity,
        displayName: room.template.displayName,
        displayNameId: 0,
        perUserAvId: avatar.perUserId,
        activePetInvId: player.petOut(false)?.invId ?? 0,
        den: true,
      }),
    )

    await session.send<RoomPropertiesOutgoing>(
      RoomPropertiesOutgoing.den(room.id, {
        pathName: den.pathName,
        enviroType: room.template.enviroType,
        denDefId: den.defId,
        roomDefId: room.template.defId,
      }),
    )

    await this.sessions.introduce(session)
    await session.send<DenStateOutgoing>(this.state(room.id, owner))
  }

  /**
   * Sends a player to the start room
   * @param session The player's session
   */
  public async sendHome(session: Session): Promise<void> {
    const { player } = session
    if (!player) return

    const from = player.roomId
    const placement = this.rooms.join(
      player,
      this.config.startRoom,
      RoomJoinType.Auto,
    )

    if (placement.room) {
      await this.venues.enter(session, placement.room, from)
    }
  }

  /**
   * Describes the placed den items
   * @param roomId The target room
   * @param owner The den's owner
   * @returns The packet
   */
  public state(roomId: number, owner: Player): DenStateOutgoing {
    return DenStateOutgoing.of(roomId, this.placed(owner), owner.placedPets)
  }

  /**
   * Lists the items placed in a den
   * @param owner The den's owner
   * @returns The items
   */
  public placed(owner: Player): PlacedDenItem[] {
    return owner.denItems
      .filter(({ categoryId }) => categoryId !== 0)
      .map((item) => ({
        ...item,
        mannequin: this.denItems.isMannequin(item.defId),
      }))
  }
}
