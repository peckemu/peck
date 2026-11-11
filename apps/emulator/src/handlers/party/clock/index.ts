import { inject, injectable } from '@needle-di/core'
import { HostedParties, RoomManager } from '@peck/game'

import { RoomJoinType } from '@peck/shared'

import { type Config } from '#emulator/config'
import { PartyVenues } from '#emulator/handlers/party/venue'
import { SessionManager } from '#emulator/sessions/manager'
import { ConfigToken } from '#emulator/tokens'

/**
 * The party cleanup interval
 */
const TICK = 15_000

/**
 * Ends hosted parties
 * @class
 */
@injectable()
export class PartyClock {
  /**
   * The emulator config
   */
  private readonly config = inject<Config>(ConfigToken)

  /**
   * The parties players host
   */
  private readonly hosted = inject<HostedParties>(HostedParties)

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
   * The timer
   */
  private timer: ReturnType<typeof setInterval> | null = null

  /**
   * Starts ending parties on time
   */
  public start(): void {
    this.timer = setInterval(() => void this.tick(), TICK)
  }

  /**
   * Stops ending parties
   */
  public stop(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  /**
   * Ends expired parties
   */
  public async tick(): Promise<void> {
    this.hosted.expire(Date.now())

    for (const room of this.rooms.all()) {
      if (this.venues.stillOn(room.template)) continue

      for (const session of this.sessions.inRoom(room.id)) {
        const { player } = session
        if (!player) continue

        const placement = this.rooms.join(
          player,
          this.config.startRoom,
          RoomJoinType.Auto,
        )
        if (placement.room) {
          await this.venues.enter(session, placement.room, room.id)
        }
      }
    }
  }
}
