import { inject, injectable } from '@needle-di/core'
import {
  chooseNode,
  NodeRegistry,
  TICKET_TTL,
  TicketStore,
} from '@peck/cluster'
import {
  AccountRepository,
  ModerationRepository,
  PlayerRepository,
} from '@peck/database'

import { type Config } from '#api/config'
import { ServiceError } from '#api/errors'
import { type Flashvars, flashvars } from '#api/modules/play/flashvars'
import { ConfigToken } from '#api/tokens'

/**
 * What the game is started with
 */
export type Play = {
  /**
   * The login ticket
   */
  readonly ticket: string

  /**
   * When the ticket stops working
   */
  readonly expiresAt: string

  /**
   * The launcher's address
   */
  readonly server: string

  /**
   * The player's username
   */
  readonly username: string

  /**
   * The player's game id, or null
   */
  readonly gameId: number | null

  /**
   * The node the game connects to
   */
  readonly node: { readonly id: number; readonly name: string }

  /**
   * The game's flashvars
   */
  readonly flashvars: Flashvars
}

/**
 * Sends players to a node
 * @class
 */
@injectable()
export class PlayService {
  /**
   * The API config
   */
  private readonly config = inject<Config>(ConfigToken)

  /**
   * Every emulator node
   */
  private readonly nodes = inject<NodeRegistry>(NodeRegistry)

  /**
   * The game tickets
   */
  private readonly tickets = inject<TicketStore>(TicketStore)

  /**
   * The accounts
   */
  private readonly accounts = inject<AccountRepository>(AccountRepository)

  /**
   * The players
   */
  private readonly players = inject<PlayerRepository>(PlayerRepository)

  /**
   * Keeps bans
   */
  private readonly moderation =
    inject<ModerationRepository>(ModerationRepository)

  /**
   * Issues a ticket
   * @param accountId The account playing
   * @returns What the game is started with
   */
  public async play(accountId: string): Promise<Play> {
    if (await this.moderation.active(accountId, 'ban')) {
      throw new ServiceError('Account is banned', 'FORBIDDEN')
    }

    const node = chooseNode(await this.nodes.list())
    if (!node) throw new ServiceError('No server is open', 'UNAVAILABLE')

    const vars = flashvars(this.config.game, node, this.config.url)

    const account = await this.accounts.byId(accountId)
    if (!account) throw new ServiceError('Account not found', 'NOT_FOUND')

    const [player] = await this.players.ofAccount(accountId)
    const ticket = await this.tickets.issue({ accountId, nodeId: node.id })

    return {
      ticket,
      expiresAt: new Date(Date.now() + TICKET_TTL).toISOString(),
      server: this.config.url,
      username: player?.username ?? account.username,
      gameId: player?.gameId ?? null,
      node: { id: node.id, name: node.name },
      flashvars: vars,
    }
  }
}
