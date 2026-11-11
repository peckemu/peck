import { inject } from '@needle-di/core'
import { DenRepository } from '@peck/database'
import {
  AvatarRules,
  DenItemCatalogue,
  DenRoomCatalogue,
  type DenRoomTemplate,
  DenRules,
  type Player,
  type Room,
  RoomManager,
} from '@peck/game'
import {
  DenChangeIncoming,
  DenChangeOutgoing,
  DenItemsOutgoing,
  type DenStateOutgoing,
  RoomJoinError,
  RoomJoinOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { DenView } from '#emulator/handlers/den/view'
import { SessionManager } from '#emulator/sessions/manager'
import { type Session } from '#emulator/sessions/session'

/**
 * The ocean
 */
const OCEAN = 1

/**
 * Switches the player's den room
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(DenChangeIncoming)
export class DenChangeHandler extends PacketHandler<DenChangeIncoming> {
  /**
   * Saves dens
   */
  private readonly dens = inject<DenRepository>(DenRepository)

  /**
   * Every den room
   */
  private readonly denRooms = inject<DenRoomCatalogue>(DenRoomCatalogue)

  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * What animals can do
   */
  private readonly animals = inject<AvatarRules>(AvatarRules)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Shows players dens
   */
  private readonly view = inject<DenView>(DenView)

  /**
   * Switches the den room
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenChangeIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const { avatar } = player

    const owned = player.denRooms.find(({ invIdx }) => invIdx === packet.invIdx)
    const denRoom = owned ? this.denRooms.get(owned.defId) : null
    const refusal = this.refusal(player, denRoom)

    if (refusal !== null || !owned || !denRoom || !avatar) {
      context.log.info({ refusal }, 'den change refused')
      if (refusal === RoomJoinError.DenOceanChange) {
        return session.send<RoomJoinOutgoing>(
          RoomJoinOutgoing.refused(packet.room, refusal, player.username),
        )
      }
      return session.send<DenChangeOutgoing>(
        DenChangeOutgoing.refused(packet.room),
      )
    }

    await this.arrange(player, owned.invIdx)

    const ocean = denRoom.enviroType === OCEAN
    await session.send<DenChangeOutgoing>(
      DenChangeOutgoing.of(
        packet.room,
        denRoom.defId,
        avatar.perUserId,
        player.petOut(ocean)?.invId ?? 0,
      ),
    )

    const den = this.rooms.moveDen(player.username, player.gameId, denRoom)
    await session.send<DenStateOutgoing>(
      this.view.state(den?.id ?? packet.room, player),
    )
    await session.send<DenItemsOutgoing>(
      DenItemsOutgoing.of(
        -1,
        player.activeDenInvIdx,
        player.denItems,
        (defId) => this.denItems.isMannequin(defId),
        player.placedPets.map(({ invId }) => invId),
      ),
    )

    if (den) await this.showVisitors(session, den, ocean)
  }

  /**
   * Finds why the player can't switch
   * @param player The player
   * @param denRoom The wanted den room
   * @returns The reason, or null
   */
  private refusal(
    player: Player,
    denRoom: DenRoomTemplate | null,
  ): string | null {
    const { avatar } = player
    if (!avatar) return 'no animal'
    if (!denRoom) return 'no such den room'
    if (
      denRoom.enviroType === OCEAN &&
      !this.animals.fits(avatar.typeId, true)
    ) {
      return RoomJoinError.DenOceanChange
    }

    return null
  }

  /**
   * Swaps the den rooms' layouts
   * @param player The owner
   * @param to The den room now in use
   */
  private async arrange(player: Player, to: number): Promise<void> {
    const from = player.activeDenInvIdx
    if (from === to) return

    const left = DenRules.layoutOf(player)
    const coming = await this.dens.layout(player.gameId, to)

    DenRules.clear(player)
    const placed = DenRules.arrange(player, coming)
    player.activeDenInvIdx = to

    await this.dens.switch(player.gameId, { from, to, left, placed })
  }

  /**
   * Shows everyone in the den its new room
   * @param owner The owner's session
   * @param den The den
   * @param ocean Whether it is in the ocean
   */
  private async showVisitors(
    owner: Session,
    den: Room,
    ocean: boolean,
  ): Promise<void> {
    const { player } = owner
    if (!player) return

    if (player.room === den) await this.sessions.introduce(owner)

    for (const visitor of this.sessions.inRoom(den.id)) {
      const typeId = visitor.player?.avatar?.typeId
      if (visitor === owner || typeId === undefined) continue

      if (ocean && !this.animals.fits(typeId, true)) {
        await this.view.sendHome(visitor)
        continue
      }

      await this.view.show(visitor, player, den)
    }
  }
}
