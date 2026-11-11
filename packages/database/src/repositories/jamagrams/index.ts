import { Block } from '#database/entities/buddies/block'
import { Buddy } from '#database/entities/buddies/buddy'
import { DenItem } from '#database/entities/den/item'
import { Item } from '#database/entities/item'
import { Jamagram } from '#database/entities/jamagram'
import { Player } from '#database/entities/player'
import { TradeListing } from '#database/entities/trade/listing'
import { type Database, type Querier } from '#database/pool'

/**
 * The most cards an inbox holds
 */
const MOST_CARDS = 100

/**
 * A card from AJHQ
 */
const AJHQ = 1

/**
 * The card AJHQ sends
 */
const AJHQ_CARD = 86

/**
 * A card with clothing on it
 */
const CLOTHING = 1

/**
 * A card with a den item on it
 */
const DEN_ITEM = 3

/**
 * Who may send a player cards
 */
const PRIVACY = { nobody: 0, buddies: 1 } as const

/**
 * Nobody wears it
 */
const UNWORN = /^0(,0)*$/

/**
 * The trade list kinds
 */
const LISTED = { clothing: 2, denItem: 0 } as const

/**
 * A card to send
 */
export type Sending = {
  /**
   * The player sending it
   */
  readonly fromGameId: number

  /**
   * The receiving player
   */
  readonly toGameId: number

  /**
   * The card's picture
   */
  readonly cardMediaId: number

  /**
   * The stamp's picture
   */
  readonly stampMediaId: number

  /**
   * What it says
   */
  readonly message: string

  /**
   * 1 safe chat, 2 typed
   */
  readonly messageType: number

  /**
   * 0 plain, 1 clothing, 3 den item
   */
  readonly type: number

  /**
   * The gift's inventory index, or -1
   */
  readonly giftInvIdx: number

  /**
   * The gift's name string id
   */
  readonly giftName: string

  /**
   * 0 normal, 1 valentine
   */
  readonly specialType: number
}

/**
 * Why a card couldn't be sent
 */
export type SendRefusal = 'player' | 'blocked' | 'privacy' | 'full' | 'gift'

/**
 * A gift
 */
export type MovedGift = {
  /**
   * The moving player
   */
  readonly gameId: number

  /**
   * Clothing 1 or den item 3
   */
  readonly type: number

  /**
   * Its place in their inventory
   */
  readonly invIdx: number

  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its colour
   */
  readonly color: number

  /**
   * Which of a den item's looks
   */
  readonly version: number
}

/**
 * A card in an inbox
 */
export type InboxCard = {
  /**
   * The card
   */
  readonly card: Omit<Jamagram, 'sender'>

  /**
   * The sender's username
   */
  readonly senderName: string

  /**
   * The sender's account type
   */
  readonly senderAccountType: number
}

/**
 * Handles Jam-a-Grams
 * @class
 */
export class JamagramRepository {
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
   * Lists a player's cards
   * @param gameId The player
   * @returns The cards
   */
  public async inbox(gameId: number): Promise<InboxCard[]> {
    const cards = await this.database.findMany(Jamagram, {
      $where: { toGameId: gameId, deletedAt: null },
      $populate: { sender: true },
      $sort: { id: 'asc' },
    })

    return cards.map((card) => ({
      card,
      senderName: card.sender?.username ?? '',
      senderAccountType: card.sender?.accountType ?? 0,
    }))
  }

  /**
   * Finds a card in a player's inbox
   * @param gameId The player
   * @param id The card
   * @returns The card, or null
   */
  public async card(gameId: number, id: number): Promise<InboxCard | null> {
    const card = await this.database.findOne(Jamagram, {
      $where: { id, toGameId: gameId, deletedAt: null },
      $populate: { sender: true },
    })
    if (!card) return null

    return {
      card,
      senderName: card.sender?.username ?? '',
      senderAccountType: card.sender?.accountType ?? 0,
    }
  }

  /**
   * Changes a player's card privacy
   * @param gameId The player
   * @param setting 0 nobody, 1 buddies, 2 everyone
   */
  public async privacy(gameId: number, setting: number): Promise<void> {
    await this.database.updateOneById(Player, gameId, { ecardPrivacy: setting })
  }

  /**
   * Counts a player's unread cards
   * @param gameId The player
   * @returns How many
   */
  public async unread(gameId: number): Promise<number> {
    return this.database.count(Jamagram, {
      $where: { toGameId: gameId, deletedAt: null, read: false },
    })
  }

  /**
   * Sends a card
   * @param sending The card
   * @returns The card, or the refusal
   */
  public async send(
    sending: Sending,
  ): Promise<
    | { readonly card: Jamagram; readonly taken: MovedGift | null }
    | { readonly refusal: SendRefusal }
  > {
    const { fromGameId, toGameId } = sending
    if (fromGameId === toGameId) return { refusal: 'player' }

    return this.database.transaction(async (querier) => {
      const [first, second] =
        fromGameId < toGameId ? [fromGameId, toGameId] : [toGameId, fromGameId]
      await querier.all`SELECT game_id FROM players WHERE game_id IN (${first}, ${second}) ORDER BY game_id FOR UPDATE`

      const recipient = await querier.findOneById(Player, toGameId)
      if (
        !recipient ||
        !(await querier.exists(Player, { $where: { gameId: fromGameId } }))
      ) {
        return { refusal: 'player' as const }
      }

      const blocked = await querier.exists(Block, {
        $where: {
          blockerGameId: { $in: [fromGameId, toGameId] },
          blockedGameId: { $in: [fromGameId, toGameId] },
        },
      })
      if (blocked) return { refusal: 'blocked' as const }

      if (!(await JamagramRepository.accepts(querier, recipient, fromGameId))) {
        return { refusal: 'privacy' as const }
      }

      const held = await querier.count(Jamagram, {
        $where: { toGameId, deletedAt: null },
      })
      if (held >= MOST_CARDS) return { refusal: 'full' as const }

      const taken =
        sending.type === 0
          ? null
          : await JamagramRepository.take(querier, fromGameId, sending)
      if (sending.type !== 0 && !taken) return { refusal: 'gift' as const }

      const [row] = await querier.insertMany(
        Jamagram,
        [
          {
            toGameId,
            fromGameId,
            cardMediaId: sending.cardMediaId,
            stampMediaId: sending.stampMediaId,
            message: sending.message,
            messageType: sending.messageType,
            type: taken ? sending.type : 0,
            giftId: taken?.defId ?? 0,
            giftColor: taken?.color ?? 0,
            giftName: taken ? sending.giftName : '',
            giftVersion: taken?.version ?? 0,
            specialType: sending.specialType,
          },
        ],
        { returning: { id: true } },
      )

      const card = await querier.findOneById(Jamagram, row?.id ?? 0)
      if (!card) throw new Error('Jam-a-Gram was not saved')

      return { card, taken }
    })
  }

  /**
   * Sends a card from AJHQ
   * @param toGameId The player
   * @param message The message's string id
   * @returns The card's id
   */
  public async fromAjhq(toGameId: number, message: string): Promise<number> {
    const [row] = await this.database.insertMany(
      Jamagram,
      [
        {
          toGameId,
          fromGameId: null,
          senderType: AJHQ,
          cardMediaId: AJHQ_CARD,
          message,
          messageType: 1,
          type: 0,
        },
      ],
      { returning: { id: true } },
    )

    return row?.id ?? 0
  }

  /**
   * Marks a card read
   * @param gameId The recipient
   * @param id The card
   * @returns Whether it is theirs
   */
  public async read(gameId: number, id: number): Promise<boolean> {
    const changed = await this.database.updateMany(
      Jamagram,
      { $where: { id, toGameId: gameId, deletedAt: null } },
      { read: true },
    )

    return changed > 0
  }

  /**
   * Deletes cards
   * @param gameId The recipient
   * @param ids The cards
   * @returns The deleted cards and returned gifts
   */
  public async remove(
    gameId: number,
    ids: readonly number[],
  ): Promise<{ readonly deleted: number[]; readonly returned: MovedGift[] }> {
    return this.database.transaction(async (querier) => {
      const cards = await querier.findMany(Jamagram, {
        $where: { id: { $in: [...ids] }, toGameId: gameId, deletedAt: null },
      })

      const returned: MovedGift[] = []
      for (const card of cards) {
        await querier.updateOneById(Jamagram, card.id, {
          deletedAt: new Date(),
        })

        if (JamagramRepository.waiting(card) && card.fromGameId) {
          returned.push(
            await JamagramRepository.give(querier, card.fromGameId, card),
          )
          await querier.updateOneById(Jamagram, card.id, { giftKept: false })
        }
      }

      return { deleted: cards.map(({ id }) => id), returned }
    })
  }

  /**
   * Accepts or returns a card's gift
   * @param gameId The recipient
   * @param id The card
   * @param keep Whether they keep it
   * @returns The gift, or null
   */
  public async answer(
    gameId: number,
    id: number,
    keep: boolean,
  ): Promise<MovedGift | null> {
    return this.database.transaction(async (querier) => {
      const card = await querier.findOne(Jamagram, {
        $where: { id, toGameId: gameId, deletedAt: null },
      })
      if (!card?.fromGameId || !JamagramRepository.waiting(card)) return null

      const moved = await JamagramRepository.give(
        querier,
        keep ? gameId : card.fromGameId,
        card,
      )
      await querier.updateOneById(Jamagram, id, { giftKept: keep })

      return moved
    })
  }

  /**
   * Checks a card's gift is waiting
   * @param card The card
   * @returns Whether it does
   */
  private static waiting(card: Jamagram): boolean {
    return (
      (card.type === CLOTHING || card.type === DEN_ITEM) &&
      (card.giftKept ?? null) === null
    )
  }

  /**
   * Checks a player accepts cards from someone
   * @param querier The querier
   * @param recipient The player
   * @param fromGameId The sender
   * @returns Whether they do
   */
  private static async accepts(
    querier: Querier,
    recipient: Player,
    fromGameId: number,
  ): Promise<boolean> {
    if (recipient.ecardPrivacy === PRIVACY.nobody) return false
    if (recipient.ecardPrivacy !== PRIVACY.buddies) return true

    return querier.exists(Buddy, {
      $where: { gameId: recipient.gameId, buddyGameId: fromGameId },
    })
  }

  /**
   * Takes the gift from the sender
   * @param querier The querier
   * @param gameId The sender
   * @param sending The card
   * @returns The gift, or null
   */
  private static async take(
    querier: Querier,
    gameId: number,
    sending: Sending,
  ): Promise<MovedGift | null> {
    const invIdx = sending.giftInvIdx

    if (sending.type === CLOTHING) {
      const item = await querier.findOne(Item, {
        $where: { gameId, invId: invIdx, denStoreInvIdx: 0 },
      })
      if (!item || !UNWORN.test(item.equippedAvatars)) return null

      await querier.deleteMany(Item, { $where: { gameId, invId: invIdx } })
      await querier.deleteMany(TradeListing, {
        $where: { gameId, itemKind: LISTED.clothing, invIdx },
      })

      return {
        gameId,
        type: CLOTHING,
        invIdx,
        defId: item.defId,
        color: item.color,
        version: 0,
      }
    }

    if (sending.type !== DEN_ITEM) return null

    const item = await querier.findOne(DenItem, {
      $where: {
        gameId,
        invIdx,
        categoryId: 0,
        denStoreInvIdx: 0,
        uniqueImageId: '',
      },
    })
    if (!item) return null

    await querier.deleteMany(DenItem, { $where: { gameId, invIdx } })
    await querier.deleteMany(TradeListing, {
      $where: { gameId, itemKind: LISTED.denItem, invIdx },
    })

    return {
      gameId,
      type: DEN_ITEM,
      invIdx,
      defId: item.defId,
      color: 0,
      version: item.version,
    }
  }

  /**
   * Gives a card's gift to a player
   * @param querier The querier
   * @param gameId The player
   * @param card The card
   * @returns The gift
   */
  private static async give(
    querier: Querier,
    gameId: number,
    card: Jamagram,
  ): Promise<MovedGift> {
    if (card.type === CLOTHING) {
      const [last] = await querier.findMany(Item, {
        $select: { invId: true },
        $where: { gameId },
        $sort: { invId: 'desc' },
        $limit: 1,
      })
      const invIdx = (last?.invId ?? 0) + 1
      await querier.insertOne(Item, {
        gameId,
        invId: invIdx,
        defId: card.giftId,
        color: card.giftColor,
      })

      return {
        gameId,
        type: CLOTHING,
        invIdx,
        defId: card.giftId,
        color: card.giftColor,
        version: 0,
      }
    }

    const [last] = await querier.findMany(DenItem, {
      $select: { invIdx: true },
      $where: { gameId },
      $sort: { invIdx: 'desc' },
      $limit: 1,
    })
    const invIdx = (last?.invIdx ?? 0) + 1
    await querier.insertOne(DenItem, {
      gameId,
      invIdx,
      defId: card.giftId,
      version: card.giftVersion,
    })

    return {
      gameId,
      type: DEN_ITEM,
      invIdx,
      defId: card.giftId,
      color: 0,
      version: card.giftVersion,
    }
  }
}
