import { Block } from '#database/entities/buddies/block'
import { Buddy } from '#database/entities/buddies/buddy'
import { Player } from '#database/entities/player'
import {
  Wall,
  type WallFrame,
  type WallSticker,
} from '#database/entities/wall/board'
import { WallHidden } from '#database/entities/wall/hidden'
import { type PostAvatar, WallPost } from '#database/entities/wall/post'
import { type Database, type Querier } from '#database/pool'

/**
 * Who may open a wall
 */
const SETTING = { nobody: 0, buddies: 1 } as const

/**
 * The most posts a wall shows
 */
const MOST_POSTS = 100

/**
 * The owner of a wall
 */
export type WallOwner = {
  /**
   * Their game id
   */
  readonly gameId: number

  /**
   * Their username
   */
  readonly username: string

  /**
   * Their uuid
   */
  readonly uuid: string

  /**
   * Who may open their wall
   */
  readonly wallSettings: number
}

/**
 * A player's wall access
 */
export type WallAccess = {
  /**
   * Whether they may read it
   */
  readonly read: boolean

  /**
   * Whether they may post on it
   */
  readonly write: boolean
}

/**
 * A wall post
 */
export type ShownPost = {
  /**
   * The post
   */
  readonly post: Omit<WallPost, 'sender'>

  /**
   * The poster's username
   */
  readonly senderName: string

  /**
   * The poster's uuid
   */
  readonly senderUuid: string

  /**
   * The wall's owner
   */
  readonly wall?: WallOwner
}

/**
 * A wall
 */
export type ShownWall = {
  /**
   * How it looks
   */
  readonly wall: Wall

  /**
   * Its posts
   */
  readonly posts: ShownPost[]

  /**
   * Answers to the viewer's own posts
   */
  readonly notices: ShownPost[]
}

/**
 * A post to make
 */
export type Posting = {
  /**
   * The wall's owner
   */
  readonly wallGameId: number

  /**
   * The poster
   */
  readonly senderGameId: number

  /**
   * The parent post, or null
   */
  readonly parentId: string | null

  /**
   * What it says
   */
  readonly message: string

  /**
   * The look behind the words
   */
  readonly patternId: number

  /**
   * The colour behind the words
   */
  readonly colorId: number

  /**
   * The poster's language
   */
  readonly localizationId: number

  /**
   * The poster's animal
   */
  readonly avatar: PostAvatar
}

/**
 * Changes to how a wall looks
 */
export type WallChange = {
  /**
   * Its background
   */
  readonly background?: number

  /**
   * Its status line
   */
  readonly status?: string

  /**
   * The status line's language
   */
  readonly langId?: number

  /**
   * Its stickers
   */
  readonly stickers?: WallSticker[]

  /**
   * Its masterpieces
   */
  readonly masterpieces?: WallFrame[]

  /**
   * Its photo booth picture
   */
  readonly photo?: Record<string, unknown> | null
}

/**
 * Keeps Jammer Walls
 * @class
 */
export class WallRepository {
  /**
   * The database
   */
  private readonly database: Database

  /**
   * Creates the repository
   * @param database The database
   */
  public constructor(database: Database) {
    this.database = database
  }

  /**
   * Finds a wall's owner
   * @param username Their username
   * @returns The owner, or null
   */
  public async owner(username: string): Promise<WallOwner | null> {
    const found = await this.database.findOne(Player, {
      $select: { gameId: true, username: true, uuid: true, wallSettings: true },
      $where: { username: { $ilike: username.replace(/[\\%_]/g, '\\$&') } },
    })

    return found ? WallRepository.ownerOf(found) : null
  }

  /**
   * Finds a wall's owner by id
   * @param gameId Their game id
   * @returns The owner, or null
   */
  public async ownerById(gameId: number): Promise<WallOwner | null> {
    const found = await this.database.findOne(Player, {
      $select: { gameId: true, username: true, uuid: true, wallSettings: true },
      $where: { gameId },
    })

    return found ? WallRepository.ownerOf(found) : null
  }

  /**
   * Finds a wall's owner by uuid
   * @param uuid Their uuid
   * @returns The owner, or null
   */
  public async ownerByUuid(uuid: string): Promise<WallOwner | null> {
    if (!/^[\da-f-]{36}$/i.test(uuid)) return null

    const found = await this.database.findOne(Player, {
      $select: { gameId: true, username: true, uuid: true, wallSettings: true },
      $where: { uuid },
    })

    return found ? WallRepository.ownerOf(found) : null
  }

  /**
   * Finds a player's wall access
   * @param viewerGameId The player
   * @param ownerGameId The wall's owner
   * @returns What they may do
   */
  public async access(
    viewerGameId: number,
    ownerGameId: number,
  ): Promise<WallAccess> {
    if (viewerGameId === ownerGameId) return { read: true, write: true }

    const owner = await this.database.findOne(Player, {
      $select: { wallSettings: true, wallStatus: true },
      $where: { gameId: ownerGameId },
    })
    if (
      !owner ||
      owner.wallStatus === 0 ||
      owner.wallSettings === SETTING.nobody
    ) {
      return { read: false, write: false }
    }

    const pair = [viewerGameId, ownerGameId]
    const blocked = await this.database.exists(Block, {
      $where: { blockerGameId: { $in: pair }, blockedGameId: { $in: pair } },
    })
    if (blocked) return { read: false, write: false }

    if (owner.wallSettings === SETTING.buddies) {
      const buddy = await this.database.exists(Buddy, {
        $where: { gameId: ownerGameId, buddyGameId: viewerGameId },
      })
      if (!buddy) return { read: false, write: false }
    }

    return { read: true, write: true }
  }

  /**
   * Changes a player's wall privacy
   * @param gameId The player
   * @param setting 0 nobody, 1 buddies, 2 anyone
   */
  public async setSettings(gameId: number, setting: number): Promise<void> {
    await this.database.updateOneById(Player, gameId, { wallSettings: setting })
  }

  /**
   * Counts a visit
   * @param ownerGameId The wall's owner
   */
  public async visit(ownerGameId: number): Promise<void> {
    await this.ensure(this.database, ownerGameId)
    await this.database.updateMany(
      Wall,
      { $where: { gameId: ownerGameId } },
      { visits: { $inc: 1 } },
    )
  }

  /**
   * Finds a wall's last change
   * @param ownerGameId The wall's owner
   * @returns The time, in milliseconds
   */
  public async changedAt(ownerGameId: number): Promise<number> {
    const wall = await this.ensure(this.database, ownerGameId)

    return wall.changedAt.getTime()
  }

  /**
   * Reads a wall
   * @param ownerGameId The wall's owner
   * @param viewerGameId The reader
   * @returns The wall
   */
  public async read(
    ownerGameId: number,
    viewerGameId: number,
  ): Promise<ShownWall> {
    const own = ownerGameId === viewerGameId
    const wall = await this.ensure(this.database, ownerGameId)

    const [blocks, hidden] = await Promise.all([
      this.database.findMany(Block, {
        $where: {
          $or: [
            { blockerGameId: viewerGameId },
            { blockedGameId: viewerGameId },
          ],
        },
      }),
      this.database.findMany(WallHidden, { $where: { gameId: viewerGameId } }),
    ])
    const unseen = new Set(
      blocks.flatMap((block) => [block.blockerGameId, block.blockedGameId]),
    )
    unseen.delete(viewerGameId)
    const hiddenIds = new Set(hidden.map(({ postId }) => postId))

    const found = await this.database.findMany(WallPost, {
      $where: { wallGameId: ownerGameId },
      $populate: { sender: true },
      $sort: { postedAt: 'desc' },
      $limit: MOST_POSTS,
    })
    const posts = found
      .filter(
        (post) => !unseen.has(post.senderGameId) && !hiddenIds.has(post.id),
      )
      .map((post) => WallRepository.shown(post))

    if (own) {
      await this.database.updateOneById(Wall, ownerGameId, {
        readAt: new Date(),
      })
    }

    return { wall, posts, notices: own ? await this.notices(viewerGameId) : [] }
  }

  /**
   * Posts on a wall
   * @param posting The post
   * @returns The post, or null
   */
  public async post(posting: Posting): Promise<WallPost | null> {
    return this.database.transaction(async (querier) => {
      if (posting.parentId) {
        const parent = await querier.exists(WallPost, {
          $where: {
            id: posting.parentId,
            wallGameId: posting.wallGameId,
            parentId: null,
          },
        })
        if (!parent) return null
      }

      await this.ensure(querier, posting.wallGameId)
      const [row] = await querier.insertMany(WallPost, [{ ...posting }], {
        returning: { id: true },
      })
      await WallRepository.touch(querier, posting.wallGameId)

      return (await querier.findOneById(WallPost, row?.id ?? '')) ?? null
    })
  }

  /**
   * Deletes a post and its answers
   * @param ownerGameId The wall's owner
   * @param holderGameId The holder
   * @param id The post
   * @returns Whether it was deleted
   */
  public async remove(
    ownerGameId: number,
    holderGameId: number,
    id: string,
  ): Promise<boolean> {
    return this.database.transaction(async (querier) => {
      const post = await querier.findOne(WallPost, {
        $where: { id, wallGameId: ownerGameId },
      })
      if (!post) return false
      if (holderGameId !== ownerGameId && post.senderGameId !== holderGameId) {
        return false
      }

      await querier.deleteMany(WallPost, {
        $where: { $or: [{ id }, { parentId: id }] },
      })
      await WallRepository.touch(querier, ownerGameId)

      return true
    })
  }

  /**
   * Clears a wall
   * @param ownerGameId The wall's owner
   */
  public async clear(ownerGameId: number): Promise<void> {
    await this.database.transaction(async (querier) => {
      await querier.deleteMany(WallPost, {
        $where: { wallGameId: ownerGameId },
      })
      await WallRepository.touch(querier, ownerGameId)
    })
  }

  /**
   * Hides a post from a player
   * @param gameId The player
   * @param postId The post
   */
  public async hide(gameId: number, postId: string): Promise<void> {
    await this.database.upsertOne(
      WallHidden,
      { gameId: true, postId: true },
      { gameId, postId },
    )
  }

  /**
   * Lists the posts a player hid
   * @param gameId The player
   * @returns The posts
   */
  public async hidden(gameId: number): Promise<string[]> {
    const rows = await this.database.findMany(WallHidden, {
      $where: { gameId },
    })

    return rows.map(({ postId }) => postId)
  }

  /**
   * Marks answers to a player's posts seen
   * @param gameId The player
   * @param ids The posts answered
   */
  public async acknowledge(
    gameId: number,
    ids: readonly string[],
  ): Promise<void> {
    if (ids.length === 0) return

    const mine = await this.database.findMany(WallPost, {
      $select: { id: true },
      $where: { id: { $in: [...ids] }, senderGameId: gameId },
    })
    const answered = mine.map(({ id }) => id)
    if (answered.length === 0) return

    await this.database.updateMany(
      WallPost,
      { $where: { parentId: { $in: answered } } },
      { noticeRead: true },
    )
  }

  /**
   * Changes how a wall looks
   * @param gameId The owner
   * @param change The change
   */
  public async change(gameId: number, change: WallChange): Promise<void> {
    await this.database.transaction(async (querier) => {
      await this.ensure(querier, gameId)
      await querier.updateOneById(Wall, gameId, {
        ...change,
        changedAt: new Date(),
      })
    })
  }

  /**
   * Takes masterpieces off a wall
   * @param gameId The owner
   * @param invIdxs The den items holding them
   */
  public async unhang(
    gameId: number,
    invIdxs: readonly number[],
  ): Promise<void> {
    const wall = await this.ensure(this.database, gameId)
    const masterpieces = wall.masterpieces.filter(
      ({ iid }) => !invIdxs.includes(iid),
    )

    await this.change(gameId, { masterpieces })
  }

  /**
   * Lists replies to a player's posts
   * @param gameId The player
   * @returns The answers
   */
  private async notices(gameId: number): Promise<ShownPost[]> {
    const mine = await this.database.findMany(WallPost, {
      $select: { id: true },
      $where: { senderGameId: gameId, parentId: null },
      $sort: { postedAt: 'desc' },
      $limit: MOST_POSTS,
    })
    if (mine.length === 0) return []

    const answers = await this.database.findMany(WallPost, {
      $where: {
        parentId: { $in: mine.map(({ id }) => id) },
        senderGameId: { $ne: gameId },
      },
      $populate: { sender: true },
      $sort: { postedAt: 'desc' },
    })
    const owned = answers.filter(
      (post) => post.senderGameId === post.wallGameId,
    )

    return owned.map((post) => ({
      ...WallRepository.shown(post),
      wall: {
        gameId: post.wallGameId,
        username: post.sender?.username ?? '',
        uuid: post.sender?.uuid ?? '',
        wallSettings: post.sender?.wallSettings ?? 0,
      },
    }))
  }

  /**
   * Finds or makes a wall
   * @param querier The querier
   * @param gameId The owner
   * @returns The wall
   */
  private async ensure(
    querier: Querier | Database,
    gameId: number,
  ): Promise<Wall> {
    const found = await querier.findOneById(Wall, gameId)
    if (found) return found

    await querier.upsertOne(Wall, { gameId: true }, { gameId })
    const made = await querier.findOneById(Wall, gameId)
    if (!made) throw new Error('Wall was not saved')

    return made
  }

  /**
   * Marks a wall changed
   * @param querier The querier
   * @param gameId The owner
   */
  private static async touch(querier: Querier, gameId: number): Promise<void> {
    await querier.updateOneById(Wall, gameId, { changedAt: new Date() })
  }

  /**
   * Shows a post
   * @param post The post
   * @returns The post
   */
  private static shown(
    post: Omit<WallPost, 'sender'> & { readonly sender?: Player | undefined },
  ): ShownPost {
    const { sender, ...rest } = post

    return {
      post: rest,
      senderName: sender?.username ?? '',
      senderUuid: sender?.uuid ?? '',
    }
  }

  /**
   * Reads a wall's owner
   * @param player The player
   * @returns The owner
   */
  private static ownerOf(
    player: Pick<Player, 'gameId' | 'username' | 'uuid' | 'wallSettings'>,
  ): WallOwner {
    return {
      gameId: player.gameId,
      username: player.username,
      uuid: player.uuid,
      wallSettings: player.wallSettings,
    }
  }
}
