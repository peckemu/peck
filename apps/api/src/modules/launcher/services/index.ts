import { inject, injectable } from '@needle-di/core'
import { chooseNode, NodeRegistry, TicketStore } from '@peck/cluster'
import { AccountRepository, PlayerRepository } from '@peck/database'
import { AccountType } from '@peck/shared'

import { type Config } from '#api/config'
import { ServiceError } from '#api/errors'
import { type PlayerSessionView } from '#api/modules/launcher/views'
import { type Flashvars, flashvars } from '#api/modules/play/flashvars'
import { ConfigToken } from '#api/tokens'

/**
 * Answers the launcher
 * @class
 */
@injectable()
export class LauncherService {
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
   * Builds the flashvars
   * @returns The flashvars
   */
  public async flashvars(): Promise<Flashvars> {
    const node = chooseNode(await this.nodes.list())
    if (!node) throw new ServiceError('No server is open', 'UNAVAILABLE')

    return flashvars(this.config.game, node, this.config.url)
  }

  /**
   * Reads a ticket
   * @param token The ticket token
   * @returns The player session
   */
  public async player(token: string): Promise<PlayerSessionView> {
    const ticket = await this.tickets.peek(token)
    if (!ticket) throw new ServiceError('Ticket has expired', 'UNAUTHORIZED')

    const account = await this.accounts.byId(ticket.accountId)
    if (!account) throw new ServiceError('Ticket has expired', 'UNAUTHORIZED')

    const node = await this.nodes.get(ticket.nodeId)
    if (!node) throw new ServiceError('Server is not open', 'UNAVAILABLE')

    const [player] = await this.players.ofAccount(account.id)

    return {
      id: account.id,
      screen_name: player?.username ?? account.username,
      game_account_type: player?.accountType ?? AccountType.Member,
      language: 'en',
      game_server: `${node.host}:${String(node.port)}`,
      rename_required: false,
    }
  }
}
