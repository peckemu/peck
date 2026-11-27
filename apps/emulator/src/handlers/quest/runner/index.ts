import { inject, injectable } from '@needle-di/core'
import { QuestRepository } from '@peck/database'
import {
  type Adventure,
  type Adventurer,
  Adventures,
  DenItemCatalogue,
  Item,
  PetRules,
  type Player,
  QuestAvatarType,
  QUEST_HEALTH,
  type QuestPrize,
  QuestLevels,
  type QuestTemplate,
  RoomManager,
  shardOfRoom,
} from '@peck/game'
import {
  CurrencyOutgoing,
  DenItemsOutgoing,
  ItemListOutgoing,
  QuestActorHealthOutgoing,
  QuestCancelOutgoing,
  QuestDeadOutgoing,
  QuestDeathOutgoing,
  QuestExitOutgoing,
  QuestExitTypeOutgoing,
  QuestHealthOutgoing,
  QuestLevelOutgoing,
  QuestMediaLibraryOutgoing,
  QuestMusicOutgoing,
  QuestPlayerLeftOutgoing,
  QuestRefusal,
  QuestStartOutgoing,
  QuestWaitingOutgoing,
  QuestXpOutgoing,
  RoomJoinOutgoing,
  RoomPropertiesOutgoing,
} from '@peck/packets'
import { type PacketSession, PluginEvents } from '@peck/plugins'
import { type OutgoingPacket } from '@peck/protocol'
import { CURRENCIES, QuestPrizeKind, RoomJoinType } from '@peck/shared'

import { type Config } from '../../../config/index.ts'
import { SessionManager } from '../../../sessions/manager/index.ts'
import { type Session } from '../../../sessions/session/index.ts'
import { ConfigToken } from '../../../tokens/index.ts'

/**
 * The ways out the client handles itself
 */
const CLIENT_EXITS: ReadonlySet<string> = new Set<string>(['ffm', 'flag'])

/**
 * Why an adventure was refused
 */
export type QuestRefused = readonly [QuestRefusal, number | null]

/**
 * Runs adventures
 * @class
 */
@injectable()
export class QuestRunner {
  /**
   * The emulator config
   */
  private readonly config = inject<Config>(ConfigToken)

  /**
   * Every adventure being played
   */
  private readonly adventures = inject<Adventures>(Adventures)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * Adventure progress and prizes
   */
  private readonly repository = inject<QuestRepository>(QuestRepository)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Creates the runner
   */
  public constructor() {
    const events = inject<PluginEvents>(PluginEvents)

    events.on('logout', (session) => this.quit(session))
    events.on('join', (session, roomId) => this.moved(session, roomId))
  }

  /**
   * Finds why a player can't play an adventure
   * @param player The player
   * @param template The adventure, or null
   * @param difficulty Normal 0 or hard 1
   * @returns The refusal, or null
   */
  public refusal(
    player: Player,
    template: QuestTemplate | null,
    difficulty: number,
  ): QuestRefused | null {
    const { avatar } = player
    if (!template || !avatar || !this.rooms.byDefId(template.roomDefId)) {
      return [QuestRefusal.Invalid, null]
    }

    if (this.adventures.of(player.gameId)?.started) {
      return [QuestRefusal.Busy, null]
    }
    if (template.membersOnly && !player.member) {
      return [QuestRefusal.Members, null]
    }
    if (avatar.questLevel < template.levelMin) {
      return [QuestRefusal.Level, template.levelMin]
    }
    if (difficulty > 0 && avatar.questLevel < template.hardLevelMin) {
      return [QuestRefusal.HardLevel, template.hardLevelMin]
    }

    const ocean = PetRules.inOcean(player)
    if (template.avatarType === QuestAvatarType.Land && ocean) {
      return [QuestRefusal.Land, null]
    }
    if (template.avatarType === QuestAvatarType.Ocean && !ocean) {
      return [QuestRefusal.Ocean, null]
    }

    return null
  }

  /**
   * Finds the adventure a player is playing
   * @param gameId The player
   * @returns The adventure, or null
   */
  public playing(gameId: number): Adventure | null {
    const adventure = this.adventures.of(gameId)
    return adventure?.started ? adventure : null
  }

  /**
   * Puts a player in an adventure's lobby
   * @param session The player's session
   * @param adventure The adventure
   */
  public async enlist(session: Session, adventure: Adventure): Promise<void> {
    const { player } = session
    if (!player) return

    const before = this.adventures.of(player.gameId)
    if (before && before !== adventure) await this.leaveLobby(session, false)

    const origin = player.room?.name ?? this.config.startRoom
    this.adventures.join(adventure, player.gameId, player.id, origin)
  }

  /**
   * Tells a lobby who waits
   * @param adventure The adventure
   */
  public async tellLobby(adventure: Adventure): Promise<void> {
    const userIds = adventure.players.map(({ userId }) => userId)

    await this.tell(adventure, QuestWaitingOutgoing.of(-1, userIds))
  }

  /**
   * Takes a player out of their lobby
   * @param session The player's session
   * @param tellSelf Whether to tell the player
   */
  public async leaveLobby(
    session: PacketSession,
    tellSelf = true,
  ): Promise<void> {
    const gameId = session.player?.gameId ?? -1
    const adventure = this.adventures.of(gameId)
    if (!adventure || adventure.started) return

    this.adventures.leave(gameId)
    if (tellSelf) await this.sendTo(gameId, QuestCancelOutgoing.of(-1))

    if (adventure.host === gameId) {
      for (const { gameId: other } of adventure.players) {
        this.adventures.leave(other)
        await this.sendTo(other, QuestCancelOutgoing.of(-1))
      }
      return
    }

    await this.tellLobby(adventure)
  }

  /**
   * Starts an adventure
   * @param adventure The adventure
   * @returns Whether it started
   */
  public async start(adventure: Adventure): Promise<boolean> {
    const { template } = adventure
    const room = this.rooms.adventure(
      `quest_${String(adventure.id)}`,
      template.roomDefId,
      Math.max(1, template.avatarLimit),
    )
    if (!room) return false

    adventure.room = room
    adventure.start()

    const actors = adventure.cast.map(({ template: actor }) => actor)
    const started = QuestStartOutgoing.of(
      -1,
      template.defId,
      adventure.size,
      adventure.timestamp,
      actors,
    )

    for (const adventurer of adventure.players) {
      const session = this.sessions.byPlayer(adventurer.gameId)
      if (!session) continue

      await session.send<QuestStartOutgoing>(started)
      await this.enter(session, adventure)
    }

    return true
  }

  /**
   * Takes a player out of their adventure
   * @param session The player's session
   * @param exitType How the player leaves
   */
  public async exit(session: Session, exitType: string): Promise<void> {
    const { player } = session
    if (!player) return

    const left = this.adventures.leave(player.gameId)
    if (!left) return

    const { adventure, adventurer } = left
    await this.tellLeft(adventure, player)

    const roomId = player.roomId
    await session.send<QuestExitOutgoing>(QuestExitOutgoing.of(roomId))

    if (CLIENT_EXITS.has(exitType)) {
      return session.send<QuestExitTypeOutgoing>(
        QuestExitTypeOutgoing.of(roomId, exitType),
      )
    }

    await this.goBack(session, adventurer)
  }

  /**
   * Sends a packet to an adventure's players
   * @param adventure The adventure
   * @param packet The packet
   * @param except The player left out, or null
   */
  public async tell(
    adventure: Adventure,
    packet: OutgoingPacket,
    except: number | null = null,
  ): Promise<void> {
    for (const { gameId } of adventure.players) {
      if (gameId !== except) await this.sendTo(gameId, packet)
    }
  }

  /**
   * Tells everyone a player's health
   * @param adventure The adventure
   * @param adventurer The player
   * @param change The change
   */
  public async tellHealth(
    adventure: Adventure,
    adventurer: Adventurer,
    change: number,
  ): Promise<void> {
    const roomId = adventure.room?.id ?? -1

    await this.tell(
      adventure,
      QuestHealthOutgoing.of(roomId, {
        userId: adventurer.userId,
        change,
        health: adventurer.health,
        maxHealth: QUEST_HEALTH,
      }),
    )

    if (adventurer.health === 0) {
      await this.tell(
        adventure,
        QuestDeadOutgoing.of(roomId, adventurer.userId),
      )
    }
  }

  /**
   * Hits an actor and tells everyone
   * @param adventure The adventure
   * @param actorId The actor
   * @param damage The damage
   * @param attacker The player who hit it, or null
   */
  public async strike(
    adventure: Adventure,
    actorId: string,
    damage: number,
    attacker: Session | null,
  ): Promise<void> {
    const hit = adventure.hit(actorId, damage)
    if (!hit) return

    const roomId = adventure.room?.id ?? -1
    const { dealt } = hit
    await this.tell(
      adventure,
      QuestActorHealthOutgoing.hit(
        roomId,
        actorId,
        hit.healthPercent,
        dealt,
        false,
      ),
    )
    if (!hit.defeated) return

    await this.tell(adventure, QuestDeathOutgoing.of(roomId, actorId, dealt))
    if (attacker) {
      await this.giveXp(attacker, adventure, hit.actor.template.xp, actorId)
    }
  }

  /**
   * Gives a player a prize
   * @param session The player's session
   * @param adventure The adventure
   * @param prize The prize
   */
  public async award(
    session: Session,
    adventure: Adventure,
    prize: QuestPrize,
  ): Promise<void> {
    const { player } = session
    if (!player) return

    const won = await this.repository.win(
      player.gameId,
      adventure.template.defId,
      prize,
    )
    session.log.info(
      { defId: adventure.template.defId, kind: prize.kind, value: prize.value },
      'adventure prize',
    )

    if (prize.kind === QuestPrizeKind.Clothing && won.invId !== null) {
      return this.giveClothing(session, player, won.invId, prize)
    }
    if (prize.kind === QuestPrizeKind.DenItem && won.invId !== null) {
      return this.giveDenItem(session, player, won.invId, prize.value)
    }
    if (won.balance === null) return

    const currency = prize.kind === QuestPrizeKind.Gems ? 'gems' : 'orbs'
    player.wallet.set(currency, won.balance)
    await session.send<CurrencyOutgoing>(
      CurrencyOutgoing.of(CURRENCIES.indexOf(currency), won.balance),
    )
  }

  /**
   * Gives a player adventure experience
   * @param session The player's session
   * @param adventure The adventure
   * @param amount The experience
   * @param actorId The actor that gave it
   */
  public async giveXp(
    session: Session,
    adventure: Adventure,
    amount: number,
    actorId: string,
  ): Promise<void> {
    const { player } = session
    const avatar = player?.avatar
    if (!player || !avatar || amount <= 0) return

    const totalXp = await this.repository.gainXp(
      player.gameId,
      avatar.perUserId,
      amount,
    )
    if (totalXp === null) return

    const previousLevel = avatar.questLevel
    const { level, progress } = QuestLevels.standing(totalXp)
    if (level !== previousLevel) {
      avatar.questLevel = level
      await this.repository.level(player.gameId, avatar.perUserId, level)
    }

    const roomId = adventure.room?.id ?? -1
    await session.send<QuestXpOutgoing>(
      QuestXpOutgoing.of(roomId, {
        earned: amount,
        totalXp,
        previousLevel,
        level,
        levelProgress: progress,
        actorId,
      }),
    )

    if (level > previousLevel) {
      await this.tell(
        adventure,
        QuestLevelOutgoing.of(roomId, player.id, level),
        player.gameId,
      )
    }
  }

  /**
   * Moves a player into their adventure's room
   * @param session The player's session
   * @param adventure The adventure
   */
  private async enter(session: Session, adventure: Adventure): Promise<void> {
    const { player } = session
    const avatar = player?.avatar
    const { room, template } = adventure
    if (!player || !avatar || !room?.template.quest) return

    const from = player.roomId
    this.rooms.enter(player, room)
    await this.sessions.arrive(session, from)

    await session.send<RoomJoinOutgoing>(
      RoomJoinOutgoing.joinedRoom({
        name: adventure.roomName,
        id: room.id,
        users: room.size,
        capacity: room.capacity,
        displayName: room.template.sentName,
        displayNameId: room.template.nameId,
        perUserAvId: avatar.perUserId,
        activePetInvId:
          player.petOut(room.template.enviroType === 1)?.invId ?? 0,
      }),
    )
    await session.send<RoomPropertiesOutgoing>(
      RoomPropertiesOutgoing.of(room.id, {
        name: room.template.quest.pathName,
        enviroType: room.template.enviroType,
        defId: room.template.defId,
      }),
    )
    await this.sessions.introduce(session)

    for (const mediaId of template.soundPacks) {
      await session.send<QuestMediaLibraryOutgoing>(
        QuestMediaLibraryOutgoing.of(room.id, mediaId),
      )
    }
    if (template.music !== '') {
      await session.send<QuestMusicOutgoing>(
        QuestMusicOutgoing.of(room.id, template.music),
      )
    }

    const adventurer = adventure.get(player.gameId)
    if (adventurer) {
      await session.send<QuestHealthOutgoing>(
        QuestHealthOutgoing.of(room.id, {
          userId: adventurer.userId,
          change: 0,
          health: adventurer.health,
          maxHealth: QUEST_HEALTH,
        }),
      )
    }
  }

  /**
   * Sends a player back where they came from
   * @param session The player's session
   * @param adventurer The player as they adventured
   */
  private async goBack(
    session: Session,
    adventurer: Adventurer,
  ): Promise<void> {
    const { player } = session
    const avatar = player?.avatar
    if (!player || !avatar) return

    const from = player.roomId
    const back = this.rooms.join(player, adventurer.origin, RoomJoinType.Auto)
    const placement = back.room
      ? back
      : this.rooms.join(player, this.config.startRoom, RoomJoinType.Auto)
    const { room } = placement
    if (!room) return

    await this.sessions.arrive(session, from)
    await session.send<RoomJoinOutgoing>(
      RoomJoinOutgoing.joinedRoom({
        name: room.name,
        id: room.id,
        users: room.size,
        capacity: room.capacity,
        displayName: room.template.sentName,
        displayNameId: room.template.nameId,
        perUserAvId: avatar.perUserId,
        activePetInvId:
          player.petOut(room.template.enviroType === 1)?.invId ?? 0,
        shard: shardOfRoom(room.name),
      }),
    )
    await session.send<RoomPropertiesOutgoing>(
      RoomPropertiesOutgoing.of(room.id, room.template),
    )
    await this.sessions.introduce(session)
  }

  /**
   * Tells the others a player left
   * @param adventure The adventure
   * @param player The player
   */
  private async tellLeft(adventure: Adventure, player: Player): Promise<void> {
    if (!adventure.started) return this.tellLobby(adventure)

    await this.tell(
      adventure,
      QuestPlayerLeftOutgoing.of(
        adventure.room?.id ?? -1,
        player.id,
        player.avatar?.name ?? '',
      ),
    )
  }

  /**
   * Takes a player out on logout
   * @param session The player's session
   */
  private async quit(session: PacketSession): Promise<void> {
    const { player } = session
    if (!player) return

    const adventure = this.adventures.of(player.gameId)
    if (!adventure?.started) return this.leaveLobby(session, false)

    this.adventures.leave(player.gameId)
    await this.tellLeft(adventure, player)
  }

  /**
   * Takes a player out of an adventure left behind
   * @param session The player's session
   * @param roomId The room they went to
   */
  private async moved(session: PacketSession, roomId: number): Promise<void> {
    const { player } = session
    const adventure = this.adventures.of(player?.gameId ?? -1)
    if (!player || !adventure?.started || adventure.room?.id === roomId) {
      return
    }

    this.adventures.leave(player.gameId)
    await this.tellLeft(adventure, player)
  }

  /**
   * Sends a packet to a player
   * @param gameId The player
   * @param packet The packet
   */
  private async sendTo(gameId: number, packet: OutgoingPacket): Promise<void> {
    await this.sessions.byPlayer(gameId)?.send<OutgoingPacket>(packet)
  }

  /**
   * Puts a won clothing item in the inventory
   * @param session The player's session
   * @param player The player
   * @param invId The item's place
   * @param prize The prize
   */
  private async giveClothing(
    session: Session,
    player: Player,
    invId: number,
    prize: QuestPrize,
  ): Promise<void> {
    player.items.add(
      new Item({ invId, defId: prize.value, color: prize.color }),
    )

    const { avatar } = player
    if (!avatar) return

    await session.send<ItemListOutgoing>(
      ItemListOutgoing.changed(player, avatar, {
        wear: false,
        color: prize.color,
        added: [{ invId, defId: prize.value }],
        removed: [],
      }),
    )
  }

  /**
   * Puts a won den item in the inventory
   * @param session The player's session
   * @param player The player
   * @param invIdx The den item's place
   * @param defId The den item
   */
  private async giveDenItem(
    session: Session,
    player: Player,
    invIdx: number,
    defId: number,
  ): Promise<void> {
    player.denItems.push({
      invIdx,
      defId,
      categoryId: 0,
      version: 0,
      x: 0,
      y: 0,
      flipped: false,
      userNameLink: '',
      denStoreInvIdx: 0,
      uniqueImageId: '',
    })

    await session.send<DenItemsOutgoing>(
      DenItemsOutgoing.of(
        -1,
        player.activeDenInvIdx,
        player.denItems,
        (id) => this.denItems.isMannequin(id),
        player.placedPets.map(({ invId }) => invId),
      ),
    )
  }
}
