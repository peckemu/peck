import { inject, injectable } from '@needle-di/core'
import {
  type BuddyEvent,
  ClusterEvents,
  type JamagramEvent,
  type MasterpieceEvent,
  UploadTokens,
} from '@peck/cluster'
import {
  AuditRepository,
  JamagramRepository,
  MASTERPIECE_ID,
  MasterpieceRepository,
  type MasterpieceInfo,
} from '@peck/database'
import { type Logger } from '@peck/logger'

import { ServiceError } from '#api/errors'
import { Pictures } from '#api/modules/masterpieces/images'
import { MasterpiecePictures } from '#api/modules/masterpieces/pictures'
import { LoggerToken } from '#api/tokens'

/**
 * The upload reply
 */
export type UploadReply =
  | { readonly success: true; readonly uuid: string }
  | { readonly success: false }

/**
 * AJHQ's card strings
 */
const WORDS = {
  /**
   * Approved
   */
  approved: '25170',

  /**
   * Rejected with a diamond refund
   */
  diamonds: '25171',

  /**
   * Rejected with a token refund
   */
  token: '29047',
} as const

/**
 * Handles masterpieces
 * @class
 */
@injectable()
export class MasterpieceService {
  /**
   * Keeps masterpieces
   */
  private readonly masterpieces = inject<MasterpieceRepository>(
    MasterpieceRepository,
  )

  /**
   * The pictures
   */
  private readonly pictures = inject<MasterpiecePictures>(MasterpiecePictures)

  /**
   * Upload tokens
   */
  private readonly tokens = inject<UploadTokens>(UploadTokens)

  /**
   * Events to the nodes
   */
  private readonly events =
    inject<ClusterEvents<BuddyEvent | JamagramEvent | MasterpieceEvent>>(
      ClusterEvents,
    )

  /**
   * Keeps Jam-a-Grams
   */
  private readonly jamagrams = inject<JamagramRepository>(JamagramRepository)

  /**
   * The audit log
   */
  private readonly audit = inject<AuditRepository>(AuditRepository)

  /**
   * The logger
   */
  private readonly log = inject<Logger>(LoggerToken)

  /**
   * Keeps an upload
   * @param token The upload token
   * @param image The picture
   * @returns What the studio is told
   */
  public async upload(
    token: string,
    image: Uint8Array | null,
  ): Promise<UploadReply> {
    const failed = { success: false } as const
    if (!image || !this.pictures.ready) return failed

    const picture = Pictures.read(image)
    if (!picture) return failed

    const gameId = await this.tokens.redeem(token)
    if (gameId === null) return failed

    const added = await this.masterpieces.add(gameId, picture.type)
    if (!added) {
      this.log.info({ gameId }, 'masterpiece upload refused')
      return failed
    }

    try {
      await this.pictures.put(added.uniqueImageId, image, picture.type)
    } catch (error) {
      this.log.warn({ err: error, gameId }, 'masterpiece picture not kept')
      await this.masterpieces.forget(added.uniqueImageId)

      return failed
    }

    await this.pictures.remove(added.discarded).catch((error: unknown) => {
      this.log.warn({ err: error }, 'old masterpiece pictures not removed')
    })

    return { success: true, uuid: added.uniqueImageId }
  }

  /**
   * Finds a picture
   * @param uniqueImageId The masterpiece
   * @param review Whether staff ask
   * @returns The picture and its type, or null
   */
  public async picture(
    uniqueImageId: string,
    review = false,
  ): Promise<{ readonly file: Blob; readonly type: string } | null> {
    if (!MASTERPIECE_ID.test(uniqueImageId)) return null

    const statuses = review
      ? (['pending', 'approved'] as const)
      : (['approved'] as const)
    const type = await this.masterpieces.imageType(uniqueImageId, statuses)
    const file = type === null ? null : this.pictures.file(uniqueImageId)

    return file && type !== null ? { file, type } : null
  }

  /**
   * Lists pending masterpieces
   * @returns The masterpieces
   */
  public async pending(): Promise<MasterpieceInfo[]> {
    return this.masterpieces.pending()
  }

  /**
   * Approves or rejects a masterpiece
   * @param actorId The staff account
   * @param uniqueImageId The masterpiece
   * @param approve Whether to approve it
   */
  public async decide(
    actorId: string,
    uniqueImageId: string,
    approve: boolean,
  ): Promise<void> {
    const decision = await this.masterpieces.decide(uniqueImageId, approve)
    if (!decision) {
      throw new ServiceError('Masterpiece is not waiting', 'NOT_FOUND')
    }

    if (!approve) {
      await this.pictures.remove([uniqueImageId]).catch((error: unknown) => {
        this.log.warn(
          { err: error, uniqueImageId },
          'rejected masterpiece picture not removed',
        )
      })
    }

    await this.events.publish({
      type: 'masterpiece-decided',
      gameId: decision.creatorGameId,
      uniqueImageId,
      approved: approve,
      diamonds: decision.diamonds,
      token: decision.token,
    })

    const words = approve
      ? WORDS.approved
      : decision.token
        ? WORDS.token
        : WORDS.diamonds
    const card = await this.jamagrams.fromAjhq(decision.creatorGameId, words)
    await this.events.publish({
      type: 'jamagram-sent',
      to: decision.creatorGameId,
      id: card,
    })

    await this.audit.record({
      actorId,
      action: approve ? 'masterpiece.approved' : 'masterpiece.rejected',
      targetKind: 'masterpiece',
      targetId: uniqueImageId,
      targetName: String(decision.creatorGameId),
      detail: { refunded: decision.refunded },
    })
  }
}
