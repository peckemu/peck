import { randomUUID } from 'node:crypto'

import { CURRENCIES } from '@peck/shared'

import { DenItem } from '#database/entities/den/item'
import {
  Masterpiece,
  type MasterpieceStatus,
} from '#database/entities/masterpiece'
import { Player } from '#database/entities/player'
import { TradeListing } from '#database/entities/trade/listing'
import { TransactionCurrency } from '#database/entities/transactions/currency'
import { Transaction } from '#database/entities/transactions/transaction'
import { type Database } from '#database/pool'

/**
 * The daily upload limit
 */
export const UPLOADS_PER_DAY = 5

/**
 * The frame's token den item
 */
export const MASTERPIECE_TOKEN = 2947

/**
 * The pending masterpiece limit
 */
const MOST_PENDING = 20

/**
 * A day
 */
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * What a masterpiece id looks like
 */
export const MASTERPIECE_ID =
  /^ps-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/

/**
 * A masterpiece's painter
 */
export type MasterpieceInfo = {
  /**
   * Its id
   */
  readonly uniqueImageId: string

  /**
   * Whether staff approved it
   */
  readonly approved: boolean

  /**
   * The painter
   */
  readonly creatorGameId: number

  /**
   * The painter's uuid
   */
  readonly creatorUuid: string

  /**
   * The painter's username
   */
  readonly creatorName: string
}

/**
 * A masterpiece staff decided
 */
export type Decision = {
  /**
   * The painter
   */
  readonly creatorGameId: number

  /**
   * Whether it was approved
   */
  readonly approved: boolean

  /**
   * The refunded diamonds, or 0
   */
  readonly refunded: number

  /**
   * The painter's diamonds afterwards
   */
  readonly diamonds: number

  /**
   * The returned token, or null
   */
  readonly token: { readonly invIdx: number; readonly defId: number } | null
}

/**
 * Keeps masterpieces
 * @class
 */
export class MasterpieceRepository {
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
   * Adds an upload
   * @param gameId The painter
   * @param imageType The picture's type
   * @returns The upload, or null
   */
  public async add(
    gameId: number,
    imageType: string,
  ): Promise<{
    readonly uniqueImageId: string
    readonly discarded: string[]
  } | null> {
    return this.database.transaction(async (querier) => {
      await querier.all`SELECT game_id FROM players WHERE game_id = ${gameId} FOR UPDATE`

      const today = await querier.count(Masterpiece, {
        $where: {
          creatorGameId: gameId,
          createdAt: { $gte: new Date(Date.now() - DAY_MS) },
        },
      })
      const pending = await querier.count(Masterpiece, {
        $where: { creatorGameId: gameId, status: 'pending' },
      })
      if (today >= UPLOADS_PER_DAY || pending >= MOST_PENDING) return null

      const unframed = await querier.findMany(Masterpiece, {
        $select: { uniqueImageId: true },
        $where: { creatorGameId: gameId, status: 'uploaded' },
      })
      const discarded = unframed.map(({ uniqueImageId }) => uniqueImageId)
      if (discarded.length > 0) {
        await querier.updateMany(
          Masterpiece,
          { $where: { uniqueImageId: { $in: discarded } } },
          { status: 'discarded' },
        )
      }

      const uniqueImageId = `ps-${randomUUID()}`
      await querier.insertOne(Masterpiece, {
        uniqueImageId,
        creatorGameId: gameId,
        imageType,
      })

      return { uniqueImageId, discarded }
    })
  }

  /**
   * Forgets an upload
   * @param uniqueImageId The masterpiece
   */
  public async forget(uniqueImageId: string): Promise<void> {
    await this.database.deleteMany(Masterpiece, {
      $where: { uniqueImageId, status: 'uploaded' },
    })
  }

  /**
   * Finds a masterpiece's picture type
   * @param uniqueImageId The masterpiece
   * @param statuses The statuses it may be in
   * @returns The type, or null
   */
  public async imageType(
    uniqueImageId: string,
    statuses: readonly MasterpieceStatus[],
  ): Promise<string | null> {
    if (!MASTERPIECE_ID.test(uniqueImageId)) return null

    const art = await this.database.findOne(Masterpiece, {
      $select: { imageType: true },
      $where: { uniqueImageId, status: { $in: [...statuses] } },
    })

    return art?.imageType ?? null
  }

  /**
   * Finds masterpieces by id
   * @param ids Their ids
   * @returns Them by id
   */
  public async byIds(
    ids: readonly string[],
  ): Promise<Map<string, MasterpieceInfo>> {
    const wanted = [...new Set(ids.filter((id) => id !== ''))]
    if (wanted.length === 0) return new Map()

    const found = await this.database.findMany(Masterpiece, {
      $where: { uniqueImageId: { $in: wanted } },
      $populate: { creator: true },
    })

    return new Map(
      found.map((art) => [art.uniqueImageId, MasterpieceRepository.info(art)]),
    )
  }

  /**
   * Names who painted a masterpiece
   * @param uniqueImageId The masterpiece
   * @param viewerGameId The viewer
   * @returns Their username
   */
  public async creator(
    uniqueImageId: string,
    viewerGameId: number,
  ): Promise<string> {
    const art = (await this.byIds([uniqueImageId])).get(uniqueImageId)
    if (!art) return ''

    return art.approved || art.creatorGameId === viewerGameId
      ? art.creatorName
      : ''
  }

  /**
   * Finds the newest masterpieces
   * @param limit How many
   * @returns The masterpieces
   */
  public async newest(
    limit: number,
  ): Promise<(MasterpieceInfo & { readonly frame: number })[]> {
    const found = await this.database.findMany(Masterpiece, {
      $where: { status: 'approved' },
      $populate: { creator: true },
      $sort: { decidedAt: 'desc' },
      $limit: limit,
    })

    const frames = await this.database.findMany(DenItem, {
      $select: { uniqueImageId: true, version: true },
      $where: {
        uniqueImageId: { $in: found.map(({ uniqueImageId }) => uniqueImageId) },
      },
    })
    const frame = new Map(
      frames.map((item) => [item.uniqueImageId, item.version]),
    )

    return found.map((art) => ({
      ...MasterpieceRepository.info(art),
      frame: frame.get(art.uniqueImageId) ?? 0,
    }))
  }

  /**
   * Lists pending masterpieces
   * @returns The masterpieces
   */
  public async pending(): Promise<MasterpieceInfo[]> {
    const found = await this.database.findMany(Masterpiece, {
      $where: { status: 'pending' },
      $populate: { creator: true },
      $sort: { createdAt: 'asc' },
    })

    return found.map((art) => MasterpieceRepository.info(art))
  }

  /**
   * Approves or rejects a masterpiece
   * @param uniqueImageId The masterpiece
   * @param approve Whether to approve it
   * @returns The decision, or null
   */
  public async decide(
    uniqueImageId: string,
    approve: boolean,
  ): Promise<Decision | null> {
    return this.database.transaction(async (querier) => {
      const art = await querier.findOne(Masterpiece, {
        $where: { uniqueImageId, status: 'pending' },
      })
      if (!art) return null

      const gameId = art.creatorGameId
      await querier.updateOneById(Masterpiece, uniqueImageId, {
        status: approve ? 'approved' : 'rejected',
        decidedAt: new Date(),
      })

      let refunded = 0
      let token: Decision['token'] = null
      if (!approve) {
        const frames = await querier.findMany(DenItem, {
          $where: { uniqueImageId },
        })
        for (const frame of frames) {
          await querier.deleteMany(DenItem, {
            $where: { gameId: frame.gameId, invIdx: frame.invIdx },
          })
          await querier.deleteMany(TradeListing, {
            $where: { gameId: frame.gameId, itemKind: 0, invIdx: frame.invIdx },
          })
        }

        if (art.tokenPaid) {
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
            defId: MASTERPIECE_TOKEN,
          })
          token = { invIdx, defId: MASTERPIECE_TOKEN }
        }

        refunded = art.tokenPaid ? 0 : art.diamondsPaid
        if (refunded > 0) {
          await querier.updateMany(
            Player,
            { $where: { gameId } },
            { diamonds: { $inc: refunded } },
          )
        }
      }

      const player = await querier.findOne(Player, {
        $select: { diamonds: true },
        $where: { gameId },
      })
      const diamonds = player?.diamonds ?? 0

      if (refunded > 0) {
        const [row] = await querier.insertMany(
          Transaction,
          [{ gameId, kind: 'masterpiece-refund' }],
          { returning: { id: true } },
        )
        await querier.insertOne(TransactionCurrency, {
          transactionId: row?.id ?? 0,
          currency: CURRENCIES.indexOf('diamonds'),
          change: refunded,
          balance: diamonds,
        })
      }

      return {
        creatorGameId: gameId,
        approved: approve,
        refunded,
        diamonds,
        token,
      }
    })
  }

  /**
   * Reads a masterpiece's details
   * @param art The masterpiece
   * @returns Its details
   */
  private static info(
    art: Omit<Masterpiece, 'creator'> & {
      readonly creator?: Player | undefined
    },
  ): MasterpieceInfo {
    return {
      uniqueImageId: art.uniqueImageId,
      approved: art.status === 'approved',
      creatorGameId: art.creatorGameId,
      creatorUuid: art.creator?.uuid ?? '',
      creatorName: art.creator?.username ?? '',
    }
  }
}
