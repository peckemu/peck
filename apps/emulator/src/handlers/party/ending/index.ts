import { inject, injectable } from '@needle-di/core'
import { ClusterEvents, type PartyEvent, type StaffEvent } from '@peck/cluster'
import { ShopRepository } from '@peck/database'
import { HostedParties } from '@peck/game'
import { type Logger } from '@peck/logger'
import { HostedPartyKilledOutgoing } from '@peck/packets'

import { PartyClock } from '../clock/index.ts'
import { SessionManager } from '../../../sessions/manager/index.ts'
import { LoggerToken } from '../../../tokens/index.ts'

/**
 * Ends hosted parties early
 * @class
 */
@injectable()
export class PartyEndings {
  /**
   * The hosted parties
   */
  private readonly hosted = inject<HostedParties>(HostedParties)

  /**
   * Pays for things
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * Ends parties on time
   */
  private readonly clock = inject<PartyClock>(PartyClock)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Events between nodes
   */
  private readonly events =
    inject<ClusterEvents<StaffEvent | PartyEvent>>(ClusterEvents)

  /**
   * The logger
   */
  private readonly logger = inject<Logger>(LoggerToken)

  /**
   * Starts listening
   */
  public async start(): Promise<void> {
    await this.events.listen((event) => {
      const handled =
        event.type === 'party-ended'
          ? this.end(event.hostGameId)
          : event.type === 'party-refunded'
            ? this.refunded(event)
            : null

      void handled?.catch((error: unknown) => {
        this.logger.warn({ err: error, type: event.type }, 'party event failed')
      })
    })
  }

  /**
   * Ends a party on this node
   * @param hostGameId The host's id in the database
   * @returns Whether it was ended
   */
  public async end(hostGameId: number): Promise<boolean> {
    const party = this.hosted.end(hostGameId, Date.now())
    if (!party) return false

    const balance = await this.shops.refundParty(hostGameId, party.diamonds)
    if (balance !== null) {
      await this.events.publish({
        type: 'party-refunded',
        to: hostGameId,
        refunded: party.diamonds,
        balance,
      })
    }

    await this.clock.tick()

    this.logger.info(
      { hostGameId, refunded: balance === null ? 0 : party.diamonds },
      'hosted party ended',
    )

    return true
  }

  /**
   * Tells a host on this node
   * @param event The refund
   */
  private async refunded(event: PartyEvent): Promise<void> {
    const session = this.sessions.byPlayer(event.to)
    const player = session?.player
    if (!session || !player) return

    player.wallet.set('diamonds', event.balance)
    await session.send<HostedPartyKilledOutgoing>(
      HostedPartyKilledOutgoing.of(event.refunded),
    )
  }
}
