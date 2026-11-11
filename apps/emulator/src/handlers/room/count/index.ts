import { inject } from '@needle-di/core'
import { Presence } from '@peck/cluster'
import { type Player } from '@peck/game'
import {
  type LandCount,
  RoomCountIncoming,
  RoomCountOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * The den name prefix
 */
const DEN_PREFIX = 'den'

/**
 * The ocean land
 */
const OCEANS = 'oceans'

/**
 * Sends how many buddies are in each land
 * @class
 */
@Throttle({ limit: 5, per: 10_000 })
@Handler(RoomCountIncoming)
export class RoomCountHandler extends PacketHandler<RoomCountIncoming> {
  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Who is playing where
   */
  private readonly presence = inject<Presence>(Presence)

  /**
   * Counts the buddies by land
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: RoomCountIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const rooms = await this.buddyRooms(player)

    await session.send<RoomCountOutgoing>(
      RoomCountOutgoing.of(packet.room, RoomCountHandler.lands(rooms)),
    )
  }

  /**
   * Finds the rooms the player's buddies are in
   * @param player The player
   * @returns The room names
   */
  private async buddyRooms(player: Player): Promise<string[]> {
    const here: string[] = []
    const away: number[] = []

    for (const { gameId } of player.buddies) {
      const buddy = this.sessions.byPlayer(gameId)?.player
      if (!buddy) {
        away.push(gameId)
        continue
      }

      if (buddy.room && !buddy.invisible) here.push(buddy.room.name)
    }

    if (away.length === 0) return here

    const found = await this.presence.many(away)

    const there = found.flatMap(({ room, invisible }) =>
      room && !invisible ? [room] : [],
    )

    return [...here, ...there]
  }

  /**
   * Adds the rooms up by land
   * @param rooms The room names
   * @returns The lands
   */
  private static lands(rooms: readonly string[]): LandCount[] {
    const lands = new Map<string, { name: string; users: number }>()

    for (const name of rooms) {
      const key = RoomCountHandler.land(name)
      if (key === null) continue

      const land = lands.get(key) ?? { name, users: 0 }
      land.users++
      lands.set(key, land)
    }

    return [...lands.values()]
  }

  /**
   * Finds the land a room is in
   * @param name The room name
   * @returns The land, or null
   */
  private static land(name: string): string | null {
    if (name.startsWith(DEN_PREFIX)) return null

    const [land = '', inside = ''] = name.split('.')
    if (land !== OCEANS) return land || null

    const end = inside.indexOf('#')

    return end > 0 ? `${OCEANS}.${inside.slice(0, end)}` : null
  }
}
