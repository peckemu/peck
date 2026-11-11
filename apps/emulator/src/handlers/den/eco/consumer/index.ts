import { inject } from '@needle-di/core'
import { EcoRules, EcoSwitch, type OwnedDenItem, type Player } from '@peck/game'
import { DenEcoConsumerIncoming, DenEcoConsumerOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { DenEcoSystem } from '#emulator/handlers/den/eco/system'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * Switches a den eco item on or off
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(DenEcoConsumerIncoming)
export class DenEcoConsumerHandler extends PacketHandler<DenEcoConsumerIncoming> {
  /**
   * How a den's eco system works
   */
  private readonly rules = inject<EcoRules>(EcoRules)

  /**
   * Keeps eco items powered
   */
  private readonly system = inject<DenEcoSystem>(DenEcoSystem)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Switches the eco item
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenEcoConsumerIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const at = player.denItems.findIndex(
      ({ invIdx }) => invIdx === packet.invIdx,
    )
    const item = player.denItems[at]
    const refusal = this.refusal(item)

    if (refusal !== null || !item) {
      context.log.info({ refusal }, 'eco switch refused')
    } else {
      player.denItems[at] = {
        ...item,
        ecoConsumerState: packet.online ? EcoSwitch.On : EcoSwitch.Off,
      }
    }

    const power = await this.system.settle(
      player,
      refusal === null ? packet.invIdx : -1,
    )

    await session.send<DenEcoConsumerOutgoing>(
      DenEcoConsumerOutgoing.of(
        packet.room,
        power.consumption,
        power.generation,
        power.consumers,
      ),
    )

    if (!this.inOwnDen(player)) return

    await this.sessions.broadcast<DenEcoConsumerOutgoing>(
      player.roomId,
      DenEcoConsumerOutgoing.of(
        player.roomId,
        power.consumption,
        power.generation,
        power.consumers,
      ),
      session,
    )
  }

  /**
   * Finds why the item can't be switched
   * @param item The den item
   * @returns The reason, or null
   */
  private refusal(item: OwnedDenItem | undefined): string | null {
    if (!item) return 'no such item'
    if (item.categoryId === 0) return 'not placed'
    if (!this.rules.consumes(item.defId)) return 'not an eco item'

    return null
  }

  /**
   * Checks the player is in their own den
   * @param player The player
   * @returns Whether they are
   */
  private inOwnDen(player: Player): boolean {
    return player.room?.template.den?.ownerGameId === player.gameId
  }
}
