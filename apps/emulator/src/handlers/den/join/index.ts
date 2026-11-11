import { inject } from '@needle-di/core'
import {
  type Avatar,
  AvatarCatalogue,
  DenRoomCatalogue,
  type DenRoomTemplate,
  DenRules,
  type Player,
  RoomManager,
} from '@peck/game'
import { DenJoinIncoming, RoomJoinError, RoomJoinOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'
import { RoomJoinType } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { DenView } from '#emulator/handlers/den/view'
import { PlayerFinder } from '#emulator/sessions/finder'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * The den name prefix
 */
const DEN_PREFIX = 'den'

/**
 * The ocean
 */
const OCEAN = 1

/**
 * The ocean animal bit
 */
const SWIMS = 2

/**
 * Puts the player in a den
 * @class
 */
@Handler(DenJoinIncoming)
export class DenJoinHandler extends PacketHandler<DenJoinIncoming> {
  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * Every den room
   */
  private readonly denRooms = inject<DenRoomCatalogue>(DenRoomCatalogue)

  /**
   * Shows players dens
   */
  private readonly view = inject<DenView>(DenView)

  /**
   * Every animal
   */
  private readonly animals = inject<AvatarCatalogue>(AvatarCatalogue)

  /**
   * Joins a den
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenJoinIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const { avatar } = player
    if (!avatar) return

    const ownerName = packet.denName.startsWith(DEN_PREFIX)
      ? packet.denName.slice(DEN_PREFIX.length)
      : ''
    const owner = ownerName ? await this.finder.find(ownerName) : null
    const denRoom = owner ? this.activeDenRoom(owner) : null

    const refusal = this.refusal(player, avatar, owner, denRoom)
    const template =
      refusal === null && owner && denRoom
        ? this.rooms.den(owner.username, owner.gameId, denRoom)
        : null

    if (!owner || !template?.den) {
      const error = refusal ?? RoomJoinError.DenGone
      context.log.info({ denName: packet.denName, error }, 'den join refused')
      return session.send<RoomJoinOutgoing>(
        RoomJoinOutgoing.refused(
          packet.room,
          error,
          owner?.username ?? ownerName,
        ),
      )
    }

    const from = player.roomId

    const placement = this.rooms.join(
      player,
      template.name,
      RoomJoinType.DirectHalt,
    )
    if (!placement.room) {
      return session.send<RoomJoinOutgoing>(
        RoomJoinOutgoing.refused(
          packet.room,
          RoomJoinError.Full,
          owner.username,
        ),
      )
    }

    await this.sessions.arrive(session, from)
    await this.view.show(session, owner, placement.room)
  }

  /**
   * Finds the den room a player uses
   * @param owner The player
   * @returns The den room, or null
   */
  private activeDenRoom(owner: Player): DenRoomTemplate | null {
    const owned = owner.denRooms.find(
      ({ invIdx }) => invIdx === owner.activeDenInvIdx,
    )

    return owned ? this.denRooms.get(owned.defId) : null
  }

  /**
   * Checks a player can enter a den
   * @param visitor The player going in
   * @param avatar Their avatar
   * @param owner The den's owner
   * @param denRoom The den room in use
   * @returns The reason, or null
   */
  private refusal(
    visitor: Player,
    avatar: Avatar,
    owner: Player | null,
    denRoom: DenRoomTemplate | null,
  ): RoomJoinError | null {
    if (!owner || !denRoom) return RoomJoinError.DenGone
    if (!DenRules.welcomes(owner, visitor)) return RoomJoinError.DenLocked
    if (denRoom.enviroType === OCEAN && !this.swims(avatar)) {
      return RoomJoinError.DenOcean
    }

    return null
  }

  /**
   * Checks an avatar can swim
   * @param avatar The avatar
   * @returns Whether it is an ocean animal
   */
  private swims(avatar: Avatar): boolean {
    return (
      ((this.animals.get(avatar.typeId)?.enviroTypeFlags ?? 0) & SWIMS) !== 0
    )
  }
}
