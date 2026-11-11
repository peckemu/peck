import { inject } from '@needle-di/core'
import { TicketStore } from '@peck/cluster'
import {
  AccessRepository,
  AccountRepository,
  JamagramRepository,
  ModerationRepository,
  PlayerRepository,
} from '@peck/database'
import { MinigameCatalogue, ModerationRules, Player } from '@peck/game'
import {
  LoginIncoming,
  LoginResultOutgoing,
  MinigameInfoOutgoing,
  PetsUnlockedOutgoing,
  UserVariablesOutgoing,
} from '@peck/packets'
import {
  Guest,
  Handler,
  Keyed,
  PacketHandler,
  PluginEvents,
  Public,
  Throttle,
} from '@peck/plugins'
import { can } from '@peck/permissions'
import { LoginStatus } from '@peck/shared'

import { BuddyService } from '#emulator/cluster/buddies'
import { ClusterNode } from '#emulator/cluster/node'
import { type HandlerContext } from '#emulator/dispatch/context'
import { TradeLists } from '#emulator/handlers/trade/lists'
import { SessionManager } from '#emulator/sessions/manager'
import { MasterpieceFrames } from '#emulator/handlers/masterpiece/frames'

/**
 * The zone the game logs in to
 */
const GAME_ZONE = 'sbiLogin'

/**
 * Logs a player in
 * @class
 */
@Public()
@Guest()
@Keyed()
@Throttle({ limit: 3, per: 10_000 })
@Handler(LoginIncoming)
export class LoginHandler extends PacketHandler<LoginIncoming> {
  /**
   * The game tickets
   */
  private readonly tickets = inject<TicketStore>(TicketStore)

  /**
   * The accounts
   */
  private readonly accounts = inject<AccountRepository>(AccountRepository)

  /**
   * Who may do what
   */
  private readonly access = inject<AccessRepository>(AccessRepository)

  /**
   * Keeps bans and mutes
   */
  private readonly moderation =
    inject<ModerationRepository>(ModerationRepository)

  /**
   * This emulator's place in the cluster
   */
  private readonly node = inject<ClusterNode>(ClusterNode)

  /**
   * Reads and writes players
   */
  private readonly players = inject<PlayerRepository>(PlayerRepository)

  /**
   * Keeps Jam-a-Grams
   */
  private readonly jamagrams = inject<JamagramRepository>(JamagramRepository)

  /**
   * Puts masterpieces on den items
   */
  private readonly frames = inject<MasterpieceFrames>(MasterpieceFrames)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * The plugin events
   */
  private readonly events = inject<PluginEvents>(PluginEvents)

  /**
   * Buddies across the cluster
   */
  private readonly buddies = inject<BuddyService>(BuddyService)

  /**
   * Sends trade lists
   */
  private readonly tradeLists = inject<TradeLists>(TradeLists)

  /**
   * Every minigame
   */
  private readonly minigames = inject<MinigameCatalogue>(MinigameCatalogue)

  /**
   * Handles the login
   * @param packet The login
   * @param context The packet context
   */
  public async handle(
    packet: LoginIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { username, token } = packet
    const { session } = context

    const key = session.randomKey
    session.randomKey = null

    if (packet.zone !== GAME_ZONE || !packet.signedWith(key)) {
      return session.send<LoginResultOutgoing>(
        LoginResultOutgoing.failure('Login was not signed'),
      )
    }

    const accountId = await this.tickets.redeem(token, this.node.id)
    const account =
      accountId === null ? null : await this.accounts.byId(accountId)
    if (!account) {
      return session.send<LoginResultOutgoing>(
        LoginResultOutgoing.failure('Ticket has expired'),
      )
    }

    if (await this.moderation.active(account.id, 'ban')) {
      session.log.info({ accountId: account.id }, 'banned login refused')
      return session.send<LoginResultOutgoing>(
        LoginResultOutgoing.failure('Account is banned', LoginStatus.Banned),
      )
    }

    const player = await this.players.logIn(account, username)
    if (!player) {
      return session.send<LoginResultOutgoing>(
        LoginResultOutgoing.failure('Login was for another player'),
      )
    }
    if (session.closed) return

    /**
     * @sxip close any existing session for this player before creating a new one, big brain move to prevent duplicate logins
     * does burrow have this kind of big brain security? i doubt it ;)
     */
    await this.sessions.byPlayer(player.gameId)?.close()

    session.player = new Player(session.id, player)
    session.ticket = token
    const silenced = await this.staff(session.player)
    await this.frames.dress(session.player)
    session.log.info({ gameId: player.gameId }, 'logged in')

    await this.buddies.load(session.player)
    const online = await this.buddies.online(session.player)
    const unreadCards = await this.jamagrams.unread(player.gameId)
    const shown = Object.assign(player, {
      hasOnlineBuddies: online.size > 0,
      unreadCards,
      moderator: session.player.moderator,
      ...(silenced === null ? {} : { silenced }),
    })

    await session.send<LoginResultOutgoing>(
      LoginResultOutgoing.success(session.id, shown),
    )
    await context.reply<UserVariablesOutgoing>(UserVariablesOutgoing, {
      room: -1,
      userVars: player.variables ?? [],
    })
    await context.reply<PetsUnlockedOutgoing>(PetsUnlockedOutgoing, {
      room: -1,
      unlockedPets: player.unlockedPets,
    })
    await this.tradeLists.sendOwn(session)
    if (this.minigames.size > 0) {
      await session.send<MinigameInfoOutgoing>(
        MinigameInfoOutgoing.of(-1, [...this.minigames]),
      )
    }
    await this.events.emit('login', session)
  }

  /**
   * Loads the player's staff tools and mute
   * @param player The player
   * @returns The mute's minutes left, or null
   */
  private async staff(player: Player): Promise<number | null> {
    const actor = await this.access.actorOf(player.accountId)
    player.moderator = can(actor, 'players.moderate')
    player.invisible = player.moderator

    const mute = await this.moderation.active(player.accountId, 'mute')
    if (!mute) return null

    const ends = mute.expiresAt?.getTime() ?? null
    player.mutedUntil = ends ?? Infinity

    return ModerationRules.minutesLeft(ends)
  }
}
