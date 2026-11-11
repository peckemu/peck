import {
  AdoptAPetCountIncoming,
  AdoptAPetCountOutgoing,
  AdoptAPetsIncoming,
  AdoptAPetsOutgoing,
  AdoptAPetsSeenIncoming,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Lists a player's adopt a pet cards
 * @class
 */
@Handler(AdoptAPetsIncoming)
export class AdoptAPetsHandler extends PacketHandler<AdoptAPetsIncoming> {
  /**
   * Sends an empty list
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AdoptAPetsIncoming,
    context: HandlerContext,
  ): Promise<void> {
    await context.session.send<AdoptAPetsOutgoing>(
      AdoptAPetsOutgoing.none(packet.room),
    )
  }
}

/**
 * Counts a player's adopt a pet cards
 * @class
 */
@Handler(AdoptAPetCountIncoming)
export class AdoptAPetCountHandler extends PacketHandler<AdoptAPetCountIncoming> {
  /**
   * Sends no cards
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AdoptAPetCountIncoming,
    context: HandlerContext,
  ): Promise<void> {
    await context.session.send<AdoptAPetCountOutgoing>(
      AdoptAPetCountOutgoing.of(packet.room, 0),
    )
  }
}

/**
 * Marks adopt a pet cards seen
 * @class
 */
@Handler(AdoptAPetsSeenIncoming)
export class AdoptAPetsSeenHandler extends PacketHandler<AdoptAPetsSeenIncoming> {
  /**
   * Has nothing to mark
   */
  public async handle(): Promise<void> {
    await Promise.resolve()
  }
}
