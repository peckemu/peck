import { type Match, type MatchGems } from '#game/minigame/match'

/**
 * The most gems one award gives
 */
const MOST_GEMS = 1000

/**
 * The gems a two player game gives
 */
const PVP_GEMS: MatchGems = { lost: 5, tied: 10, won: 20 }

/**
 * The highest score
 */
export const MOST_SCORE = 9_999_999

/**
 * A minigame's room
 */
export type Table = {
  /**
   * The room id
   */
  readonly id: number

  /**
   * The game
   */
  readonly gameDefId: number

  /**
   * Whether it is played inside the room
   */
  readonly inRoom: boolean

  /**
   * The pro mode, or 0
   */
  readonly proMode: number

  /**
   * The players at it
   */
  readonly players: number[]

  /**
   * The two player match, or null
   */
  match: Match | null
}

/**
 * Players waiting to play together
 */
export type Lobby = {
  /**
   * The game
   */
  readonly gameDefId: number

  /**
   * The room they wait in
   */
  readonly roomId: number

  /**
   * The pro mode, or 0
   */
  readonly proMode: number

  /**
   * The players waiting
   */
  readonly waiting: number[]
}

/**
 * A two player game asked for
 */
export type Invite = {
  /**
   * The game
   */
  readonly gameDefId: number

  /**
   * The player asking
   */
  readonly from: number

  /**
   * The player asked
   */
  readonly to: number
}

/**
 * A player playing a minigame
 */
export type Seat = {
  /**
   * The game
   */
  readonly gameDefId: number

  /**
   * The game's room
   */
  readonly roomId: number

  /**
   * The room's players
   */
  readonly table: Table

  /**
   * Whether it is played inside the room
   */
  readonly inRoom: boolean

  /**
   * Whether the player was in the ocean
   */
  readonly ocean: boolean

  /**
   * The next gem award serial
   */
  gemSerial: number

  /**
   * The next mastery award serial
   */
  masterySerial: number

  /**
   * The score serial
   */
  readonly scoreSerial: number
}

/**
 * An award the client sent
 */
export type FoldedAward = {
  /**
   * The folded amount
   */
  readonly amountSum: number

  /**
   * The folded game
   */
  readonly gameSum: number

  /**
   * The check
   */
  readonly checkSum: number
}

/**
 * An award unfolded
 */
export type Award = {
  /**
   * The amount
   */
  readonly amount: number

  /**
   * The game
   */
  readonly gameDefId: number

  /**
   * The player's session id
   */
  readonly userId: number
}

/**
 * A score
 */
export type FoldedScore = {
  /**
   * The folded score
   */
  readonly mainSum: number

  /**
   * One check
   */
  readonly valueSum: number

  /**
   * Another check
   */
  readonly numSum: number

  /**
   * The folded user variable
   */
  readonly varRefSum: number

  /**
   * The folded game
   */
  readonly gameSum: number
}

/**
 * A score unfolded
 */
export type Score = {
  /**
   * The score
   */
  readonly score: number

  /**
   * The user variable it goes in
   */
  readonly varRef: number

  /**
   * The game
   */
  readonly gameDefId: number
}

/**
 * The minigame players
 * @class
 */
export class Minigames {
  /**
   * The seats by player
   */
  private readonly seats = new Map<number, Seat>()

  /**
   * The waiting lists by player
   */
  private readonly lobbies = new Map<number, Lobby>()

  /**
   * The invites by player
   */
  private readonly invites = new Map<number, Invite>()

  /**
   * The next game room id
   */
  private nextRoomId: number

  /**
   * Creates the minigames
   * @param firstRoomId The first game room's id
   */
  public constructor(firstRoomId = 900_000) {
    this.nextRoomId = firstRoomId
  }

  /**
   * Opens a game room
   * @param gameDefId The game
   * @param inRoom Whether it is played in the room
   * @param proMode The pro mode, or 0
   * @returns The room
   */
  public open(gameDefId: number, inRoom: boolean, proMode = 0): Table {
    return {
      id: this.nextRoomId++,
      gameDefId,
      inRoom,
      proMode,
      players: [],
      match: null,
    }
  }

  /**
   * Seats a player at a game
   * @param gameId The player
   * @param table The game's room
   * @param ocean Whether in the ocean
   * @returns The seat
   */
  public seat(gameId: number, table: Table, ocean: boolean): Seat {
    this.leave(gameId)

    const gemSerial = Minigames.serial()
    const seat: Seat = {
      gameDefId: table.gameDefId,
      roomId: table.id,
      table,
      inRoom: table.inRoom,
      ocean,
      gemSerial,
      masterySerial: Minigames.serial(),
      scoreSerial: gemSerial,
    }
    this.seats.set(gameId, seat)
    table.players.push(gameId)

    return seat
  }

  /**
   * Finds where a player is playing
   * @param gameId The player
   * @returns The seat, or null
   */
  public of(gameId: number): Seat | null {
    return this.seats.get(gameId) ?? null
  }

  /**
   * Takes a player from their game
   * @param gameId The player
   * @returns The old seat, or null
   */
  public leave(gameId: number): Seat | null {
    const seat = this.seats.get(gameId) ?? null
    this.seats.delete(gameId)

    const players = seat?.table.players ?? []
    const index = players.indexOf(gameId)
    if (index >= 0) players.splice(index, 1)

    return seat
  }

  /**
   * Checks a player is at a game or waiting
   * @param gameId The player
   * @returns Whether they are
   */
  public busy(gameId: number): boolean {
    return this.seats.has(gameId) || this.lobbies.has(gameId)
  }

  /**
   * Puts a player on a waiting list
   * @param gameId The player
   * @param lobby The list to join
   * @returns The list
   */
  public wait(gameId: number, lobby: Lobby): Lobby {
    this.leaveLobby(gameId)

    lobby.waiting.push(gameId)
    this.lobbies.set(gameId, lobby)

    return lobby
  }

  /**
   * Finds a waiting list to join
   * @param gameDefId The game
   * @param roomId The room waited in
   * @param most The most players
   * @param host A player to wait with, or null
   * @returns The list, or null
   */
  public lobbyFor(
    gameDefId: number,
    roomId: number,
    most: number,
    host: number | null,
  ): Lobby | null {
    const open = [...new Set<Lobby>(this.lobbies.values())].filter(
      (lobby) =>
        lobby.gameDefId === gameDefId &&
        lobby.roomId === roomId &&
        lobby.waiting.length < most,
    )

    const hosted = open.find((lobby) => lobby.waiting.includes(host ?? -1))
    return hosted ?? open[0] ?? null
  }

  /**
   * Finds a player's waiting list
   * @param gameId The player
   * @returns The list, or null
   */
  public lobbyOf(gameId: number): Lobby | null {
    return this.lobbies.get(gameId) ?? null
  }

  /**
   * Takes a player off their waiting list
   * @param gameId The player
   * @returns The list, or null
   */
  public leaveLobby(gameId: number): Lobby | null {
    const lobby = this.lobbies.get(gameId) ?? null
    if (!lobby) return null

    this.lobbies.delete(gameId)
    const index = lobby.waiting.indexOf(gameId)
    if (index >= 0) lobby.waiting.splice(index, 1)

    return lobby
  }

  /**
   * Empties a waiting list
   * @param lobby The list
   * @returns The players who waited
   */
  public closeLobby(lobby: Lobby): number[] {
    const players = lobby.waiting.splice(0)
    for (const gameId of players) this.lobbies.delete(gameId)

    return players
  }

  /**
   * Keeps an invite
   * @param gameDefId The game
   * @param from The player asking
   * @param to The player asked
   * @returns The invite
   */
  public invite(gameDefId: number, from: number, to: number): Invite {
    this.dropInvite(from)
    this.dropInvite(to)

    const invite: Invite = { gameDefId, from, to }
    this.invites.set(from, invite)
    this.invites.set(to, invite)

    return invite
  }

  /**
   * Finds a player's invite
   * @param gameId The player
   * @returns The invite, or null
   */
  public inviteOf(gameId: number): Invite | null {
    return this.invites.get(gameId) ?? null
  }

  /**
   * Drops a player's invite
   * @param gameId The player
   * @returns The invite, or null
   */
  public dropInvite(gameId: number): Invite | null {
    const invite = this.invites.get(gameId) ?? null
    if (!invite) return null

    this.invites.delete(invite.from)
    this.invites.delete(invite.to)

    return invite
  }

  /**
   * Rolls a new serial
   * @returns The serial
   */
  public static serial(): number {
    return 1 + Math.floor(Math.random() * 999_999)
  }

  /**
   * Works out the award cap
   * @param multiplier The game's gem multiplier
   * @returns The most gems
   */
  public static mostGems(multiplier: number): number {
    return Math.trunc(MOST_GEMS * (multiplier > 1 ? multiplier : 1))
  }

  /**
   * Works out a two player game's gems
   * @param multiplier The game's gem multiplier
   * @returns The gems for each result
   */
  public static pvpGems(multiplier: number): MatchGems {
    const times = multiplier > 1 ? multiplier : 1

    return {
      lost: Math.trunc(PVP_GEMS.lost * times),
      tied: Math.trunc(PVP_GEMS.tied * times),
      won: Math.trunc(PVP_GEMS.won * times),
    }
  }

  /**
   * Unfolds an award
   * @param folded The folded award
   * @param serial The serial
   * @returns The award, or null
   */
  public static unfoldAward(folded: FoldedAward, serial: number): Award | null {
    const { amountSum, gameSum, checkSum } = folded

    const amount = amountSum - checkSum - 2 * serial - 745
    const gameDefId = (gameSum - (serial + 83) * 5) / 3 - 49
    const userId = (checkSum - 3 * serial - 6 * amount) / 3
    if (![amount, gameDefId, userId].every(Number.isSafeInteger)) return null

    const refolded = Minigames.foldAward(amount, gameDefId, userId, serial)
    const matches =
      refolded.amountSum === amountSum &&
      refolded.gameSum === gameSum &&
      refolded.checkSum === checkSum

    return matches ? { amount, gameDefId, userId } : null
  }

  /**
   * Unfolds a score
   * @param folded The folded score
   * @param serial The serial
   * @returns The score, or null
   */
  public static unfoldScore(folded: FoldedScore, serial: number): Score | null {
    const varRef = (folded.varRefSum - 7 * serial) / 5
    const gameDefId = (folded.gameSum - serial) / 3
    const score =
      MOST_SCORE - (folded.mainSum - 3 * varRef) + 5 * varRef - serial
    if (![varRef, gameDefId, score].every(Number.isSafeInteger)) return null

    const main = MOST_SCORE - (score - 5 * varRef + serial)
    const num = main - 7 * varRef - 78_922
    const value = num - 9 * varRef + 15_645
    const matches =
      folded.valueSum === value - 8 * varRef &&
      folded.numSum === num + 5 * varRef

    return matches ? { score, varRef, gameDefId } : null
  }

  /**
   * Folds an award
   * @param amount The amount
   * @param gameDefId The game
   * @param userId The player's session id
   * @param serial The serial
   * @returns The folded award
   */
  public static foldAward(
    amount: number,
    gameDefId: number,
    userId: number,
    serial: number,
  ): FoldedAward {
    return {
      amountSum: (amount + 29) * 7 + (userId + 99) * 3 + (serial + 49) * 5,
      gameSum: (gameDefId + 49) * 3 + (serial + 83) * 5,
      checkSum: (serial + userId + amount) * 3 + amount * 3,
    }
  }

  /**
   * Folds a score
   * @param score The score
   * @param varRef The user variable it goes in
   * @param gameDefId The game
   * @param serial The serial
   * @returns The folded score
   */
  public static foldScore(
    score: number,
    varRef: number,
    gameDefId: number,
    serial: number,
  ): FoldedScore {
    const main = MOST_SCORE - (score - 5 * varRef + serial)
    const num = main - 7 * varRef - 78_922
    const value = num - 9 * varRef + 15_645

    return {
      mainSum: main + 3 * varRef,
      valueSum: value - 8 * varRef,
      numSum: num + 5 * varRef,
      varRefSum: 5 * varRef + 7 * serial,
      gameSum: gameDefId * 3 + serial,
    }
  }
}
