import { inject, injectable } from '@needle-di/core'
import { MinigameRepository } from '@peck/database'
import {
  type Lobby,
  Match,
  MinigameCatalogue,
  type MinigameTemplate,
  Minigames,
  PetRules,
  type SeatIndex,
  type Table,
  type Told,
} from '@peck/game'
import {
  MinigameEmptyOutgoing,
  MinigameGemsOutgoing,
  MinigameJoinOutgoing,
  MinigameLeftOutgoing,
  MinigameMasteryOutgoing,
  MinigameMessageOutgoing,
  MinigamePvpOutgoing,
  MinigameStartOutgoing,
  RoomChatOutgoing,
  RoomJoinOutgoing,
  type SeatedPlayer,
} from '@peck/packets'
import { type PacketSession, PluginEvents } from '@peck/plugins'
import { type OutgoingPacket } from '@peck/protocol'
import { GAME_INVITES_OFF, UserVar } from '@peck/shared'

import { SessionManager } from '#emulator/sessions/manager'
import { type Session } from '#emulator/sessions/session'

/**
 * A game played inside the room
 */
const IN_ROOM = 0

/**
 * The most players a waiting list holds
 */
const MOST_WAITING = 4

/**
 * How long a player waits alone for a game for two
 */
const ALONE_AFTER = 8_000

/**
 * Seats players at minigames
 * @class
 */
@injectable()
export class MinigameTables {
  /**
   * Every minigame
   */
  private readonly games = inject<MinigameCatalogue>(MinigameCatalogue)

  /**
   * The minigame players
   */
  private readonly minigames = inject<Minigames>(Minigames)

  /**
   * Minigame stats
   */
  private readonly repository = inject<MinigameRepository>(MinigameRepository)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * The waits for games for two
   */
  private readonly timers = new Map<Lobby, ReturnType<typeof setTimeout>>()

  /**
   * Creates the tables
   */
  public constructor() {
    inject<PluginEvents>(PluginEvents).on('logout', (session) =>
      this.quit(session),
    )
  }

  /**
   * Seats players at a game of their own and starts it
   * @param game The game
   * @param players The players' sessions
   * @param proMode The pro mode, or 0
   */
  public async play(
    game: MinigameTemplate,
    players: readonly Session[],
    proMode = 0,
  ): Promise<void> {
    const table = this.minigames.open(
      game.defId,
      game.type === IN_ROOM,
      proMode,
    )

    for (const session of players) await this.seat(session, table, game)
    await this.tellPlayers(table)
    await this.start(table)

    for (const session of players) await this.count(session, game)
  }

  /**
   * Starts a two player game
   * @param game The game
   * @param first The player named first
   * @param second The other player
   */
  public async match(
    game: MinigameTemplate,
    first: Session,
    second: Session,
  ): Promise<void> {
    const ids = [first.player?.id ?? 0, second.player?.id ?? 0] as const
    const table = this.minigames.open(game.defId, game.type === IN_ROOM)
    table.match = Match.of(game.swfName, ids)

    await this.seat(first, table, game)
    await this.seat(second, table, game)
    await this.start(table)

    await this.count(first, game)
    await this.count(second, game)
  }

  /**
   * Puts a player on a waiting list
   * @param session The player's session
   * @param game The game
   * @param hostUserId The player to wait with, or -1
   * @param proMode The pro mode, or 0
   */
  public async wait(
    session: Session,
    game: MinigameTemplate,
    hostUserId: number,
    proMode: number,
  ): Promise<void> {
    const { player } = session
    if (!player) return

    const host = this.sessions.get(hostUserId)?.player?.gameId ?? null
    const lobby = this.minigames.lobbyFor(
      game.defId,
      player.roomId,
      game.maxPlayers,
      host,
    ) ?? { gameDefId: game.defId, roomId: player.roomId, proMode, waiting: [] }

    this.minigames.wait(player.gameId, lobby)
    if (lobby.waiting.length >= game.maxPlayers) return this.startLobby(lobby)

    await this.tellLobby(lobby)

    if (game.maxPlayers === 2 && !this.timers.has(lobby)) {
      const timer = setTimeout(() => {
        this.timers.delete(lobby)
        if (lobby.waiting.length > 0) void this.startLobby(lobby)
      }, ALONE_AFTER)
      timer.unref()
      this.timers.set(lobby, timer)
    }
  }

  /**
   * Checks a game waits for others
   * @param game The game
   * @returns Whether it does
   */
  public static waits(game: MinigameTemplate): boolean {
    return game.maxPlayers >= 2 && game.maxPlayers <= MOST_WAITING
  }

  /**
   * Starts the game a waiting list waits for
   * @param lobby The list
   */
  public async startLobby(lobby: Lobby): Promise<void> {
    const timer = this.timers.get(lobby)
    if (timer) clearTimeout(timer)
    this.timers.delete(lobby)

    const game = this.games.get(lobby.gameDefId)
    const players = this.minigames
      .closeLobby(lobby)
      .flatMap((gameId): Session[] => {
        const session = this.sessions.byPlayer(gameId)
        return session ? [session] : []
      })

    if (game && players.length > 0) {
      await this.play(game, players, lobby.proMode)
    }
  }

  /**
   * Takes a player off their waiting list
   * @param session The player's session
   */
  public async leaveLobby(session: PacketSession): Promise<void> {
    const gameId = session.player?.gameId ?? -1

    const lobby = this.minigames.leaveLobby(gameId)
    if (!lobby) return

    if (lobby.waiting.length > 0) return this.tellLobby(lobby)

    const timer = this.timers.get(lobby)
    if (timer) clearTimeout(timer)
    this.timers.delete(lobby)
  }

  /**
   * Takes a player from their game
   * @param session The player's session
   */
  public async leave(session: PacketSession): Promise<void> {
    const { player } = session
    if (!player) return

    const seat = this.minigames.of(player.gameId)
    if (!seat) return

    const { table } = seat
    const { match } = table
    const decided = match?.decided ?? false
    const index = match?.seatOf(player.id) ?? null
    if (match && index !== null) match.left(index)

    this.minigames.leave(player.gameId)

    if (!decided) {
      await this.tell(
        table,
        MinigameLeftOutgoing.of(table.id, player.id),
        table.players,
      )
    }

    if (table.players.length === 0 && !session.closed) {
      await session.send<MinigameEmptyOutgoing>(
        MinigameEmptyOutgoing.of(table.id),
      )
    }
  }

  /**
   * Takes a player out of every game
   * @param session The player's session
   */
  public async arrive(session: Session): Promise<void> {
    await this.leaveLobby(session)
    await this.leave(session)
  }

  /**
   * Drops the invite a player is part of
   * @param session The player's session
   * @param tell Whether to tell the other player
   */
  public async dropInvite(session: PacketSession, tell = true): Promise<void> {
    const gameId = session.player?.gameId ?? -1

    const invite = this.minigames.dropInvite(gameId)
    if (!invite || !tell) return

    const other = invite.from === gameId ? invite.to : invite.from
    await this.sessions
      .byPlayer(other)
      ?.send<MinigamePvpOutgoing>(MinigamePvpOutgoing.refused(invite.gameDefId))
  }

  /**
   * Hosts a two player game over a player's head
   * @param session The player's session
   * @param hosting Whether to host it
   * @param gameDefId The game
   */
  public async host(
    session: Session,
    hosting: boolean,
    gameDefId: number,
  ): Promise<void> {
    const { player } = session
    if (!player?.room) return

    const game = hosting ? this.games.get(gameDefId) : null
    const hostable =
      game !== null &&
      game.readyForPvp &&
      Match.refereed(game.swfName) &&
      this.free(session)

    if (!game || !hostable) {
      if (hosting) session.log.info({ gameDefId }, 'hosted game refused')
      return this.stopHosting(session, !this.minigames.of(player.gameId))
    }

    player.hostedGame = game.defId
    const shown = RoomChatOutgoing.hostedGame(
      player.roomId,
      player.id,
      true,
      game.defId,
    )
    for (const viewer of this.viewers(session, true)) {
      await viewer.send<RoomChatOutgoing>(shown)
    }
  }

  /**
   * Stops hosting a game over a player's head
   * @param session The player's session
   * @param tellSelf Whether to tell the player
   */
  public async stopHosting(session: Session, tellSelf: boolean): Promise<void> {
    const { player } = session
    if (!player) return

    const was = player.hostedGame
    player.hostedGame = null
    if (!player.room || (!tellSelf && was === null)) return

    const shown = RoomChatOutgoing.hostedGame(
      player.roomId,
      player.id,
      false,
      was ?? 0,
    )
    for (const viewer of this.viewers(session, tellSelf)) {
      if (viewer === session || was !== null) {
        await viewer.send<RoomChatOutgoing>(shown)
      }
    }
  }

  /**
   * Finds why one player can't ask another to a game
   * @param asker The player asking
   * @param asked The player asked, or null
   * @param game The game, or null
   * @returns The reason, or null
   */
  public refusal(
    asker: Session,
    asked: Session | null,
    game: MinigameTemplate | null,
  ): string | null {
    const from = asker.player
    const to = asked?.player

    if (!game?.readyForPvp) return 'not a two player game'
    if (!Match.refereed(game.swfName)) return 'not refereed'
    if (!from || !to || asked === asker || to.invisible) return 'not here'
    if (from.buddies.blocks(to.username)) return 'blocked'
    if (to.buddies.blocks(from.username)) return 'blocked'
    if (!this.free(asker) || !this.free(asked)) return 'busy'

    const sameRoom = from.room !== null && from.roomId === to.roomId
    const buddies =
      from.buddies.has(to.username) && to.buddies.has(from.username)
    if (!sameRoom && !buddies) return 'not near'

    const settings = to.variables.get(UserVar.Settings)?.value ?? -1
    const off = (Math.trunc(settings) >> GAME_INVITES_OFF) & 1
    if (settings !== -1 && off) return 'invites off'

    return null
  }

  /**
   * Tells a match's players what the referee says
   * @param table The game's room
   * @param told What to tell
   */
  public async referee(table: Table, told: readonly Told[]): Promise<void> {
    const { match } = table
    if (!match) return

    for (const { to, data } of told) {
      const seats: readonly SeatIndex[] = to === null ? [0, 1] : [to]
      const userIds = seats.map((seat) => match.ids[seat])
      const gameIds = userIds.flatMap((userId): number[] => {
        const gameId = this.sessions.get(userId)?.player?.gameId
        return gameId === undefined ? [] : [gameId]
      })

      await this.tell(
        table,
        MinigameMessageOutgoing.of(table.id, data),
        gameIds.filter((gameId) => table.players.includes(gameId)),
      )
    }
  }

  /**
   * Takes a player out of everything on logout
   * @param session The player's session
   */
  private async quit(session: PacketSession): Promise<void> {
    await this.leaveLobby(session)
    await this.dropInvite(session)
    await this.leave(session)

    if (session.player) session.player.hostedGame = null
  }

  /**
   * Checks a player can start a game
   * @param session The player's session
   * @returns Whether they can
   */
  public free(session: Session): boolean {
    const { player } = session
    if (!player?.avatar || session.closed) return false

    return !this.minigames.busy(player.gameId)
  }

  /**
   * Finds who sees a player's hosted game
   * @param session The player's session
   * @param self Whether the player sees it
   * @returns The sessions
   */
  private viewers(session: Session, self: boolean): Session[] {
    const { player } = session
    if (!player) return []

    return this.sessions.inRoom(player.roomId).filter((each) => {
      if (each === session) return self

      return (
        !player.invisible &&
        !each.player?.buddies.blocks(player.username) &&
        !player.buddies.blocks(each.player?.username ?? '')
      )
    })
  }

  /**
   * Seats a player in a game's room
   * @param session The player's session
   * @param table The game's room
   * @param game The game
   */
  private async seat(
    session: Session,
    table: Table,
    game: MinigameTemplate,
  ): Promise<void> {
    const { player } = session
    const avatar = player?.avatar
    if (!player || !avatar) return

    await this.stopHosting(session, false)

    const ocean = PetRules.inOcean(player)
    const pet = player.petOut(ocean)
    if (!table.inRoom) await this.sessions.leave(session)

    const seat = this.minigames.seat(player.gameId, table, ocean)

    await session.send<RoomJoinOutgoing>(
      RoomJoinOutgoing.joinedRoom({
        name: `minigame.${game.swfName}_${String(table.id)}`,
        id: table.id,
        users: table.players.length,
        capacity: Math.max(game.maxPlayers, 1),
        displayName: '',
        displayNameId: 0,
        perUserAvId: avatar.perUserId,
        activePetInvId: pet?.invId ?? 0,
        game: { subRoom: table.inRoom, maxSpectators: game.maxSpectators },
      }),
    )
    await session.send<MinigameGemsOutgoing>(
      MinigameGemsOutgoing.of(seat.gemSerial, true),
    )
    await session.send<MinigameMasteryOutgoing>(
      MinigameMasteryOutgoing.of(seat.masterySerial, false),
    )
  }

  /**
   * Tells a game's players who is at it
   * @param table The game's room
   */
  private async tellPlayers(table: Table): Promise<void> {
    const joined = MinigameJoinOutgoing.players(
      table.id,
      this.userIds(table.players),
    )

    await this.tell(table, joined, table.players)
  }

  /**
   * Tells a waiting list who waits
   * @param lobby The list
   */
  private async tellLobby(lobby: Lobby): Promise<void> {
    const waiting = MinigameJoinOutgoing.players(
      lobby.roomId,
      this.userIds(lobby.waiting),
    )

    for (const gameId of lobby.waiting) {
      await this.sessions.byPlayer(gameId)?.send<MinigameJoinOutgoing>(waiting)
    }
  }

  /**
   * Starts a game
   * @param table The game's room
   */
  private async start(table: Table): Promise<void> {
    const players = table.players.flatMap((gameId): SeatedPlayer[] => {
      const player = this.sessions.byPlayer(gameId)?.player
      if (!player) return []

      return [
        {
          userId: player.id,
          perUserAvId: player.avatar?.perUserId ?? 0,
          userName: player.username,
        },
      ]
    })
    const pattern = table.match?.referee.pattern() ?? null

    await this.tell(
      table,
      MinigameStartOutgoing.of(table.id, players, pattern),
      table.players,
    )
  }

  /**
   * Sends a packet to some of a game's players
   * @param table The game's room
   * @param packet The packet
   * @param gameIds The players told
   */
  private async tell(
    table: Table,
    packet: OutgoingPacket,
    gameIds: readonly number[],
  ): Promise<void> {
    for (const gameId of gameIds) {
      if (!table.players.includes(gameId)) continue

      await this.sessions.byPlayer(gameId)?.send<OutgoingPacket>(packet)
    }
  }

  /**
   * Counts a game played
   * @param session The player's session
   * @param game The game
   */
  private async count(session: Session, game: MinigameTemplate): Promise<void> {
    const gameId = session.player?.gameId
    if (gameId === undefined) return

    await this.repository.play(gameId, game.defId)
  }

  /**
   * Finds players' session ids
   * @param gameIds The players
   * @returns The session ids
   */
  private userIds(gameIds: readonly number[]): number[] {
    return gameIds.flatMap((gameId): number[] => {
      const userId = this.sessions.byPlayer(gameId)?.player?.id
      return userId === undefined ? [] : [userId]
    })
  }
}
