import { inject, injectable } from '@needle-di/core'
import { type WallTicket, WallTokens } from '@peck/cluster'
import { ModerationRepository, WallRepository } from '@peck/database'
import { type Logger } from '@peck/logger'

import {
  POST_ID,
  type PostRequest,
  type WallRequest,
  WallRequests,
} from '#api/modules/walls/requests'
import { wallView } from '#api/modules/walls/views'
import { LoggerToken } from '#api/tokens'

/**
 * An answer to the wall service
 */
export type WallAnswer = Readonly<Record<string, unknown>>

/**
 * The longest post
 */
const LONGEST = 70

/**
 * The most posts a minute
 */
const POSTS_A_MINUTE = 6

/**
 * A minute
 */
const MINUTE = 60_000

/**
 * A failed post
 */
const NOT_POSTED = { PUT: { s: false, cs: -1 } } as const

/**
 * An expired token
 */
const BAD_TOKEN = { s: false, e: 'token' } as const

/**
 * Answers the Jammer Wall's requests
 * @class
 */
@injectable()
export class WallService {
  /**
   * Keeps walls
   */
  private readonly walls = inject<WallRepository>(WallRepository)

  /**
   * Wall tokens
   */
  private readonly tokens = inject<WallTokens>(WallTokens)

  /**
   * Keeps mutes
   */
  private readonly moderation =
    inject<ModerationRepository>(ModerationRepository)

  /**
   * The logger
   */
  private readonly log = inject<Logger>(LoggerToken)

  /**
   * The last post times
   */
  private readonly posted = new Map<number, number[]>()

  /**
   * Answers a request
   * @param body The request
   * @returns The answer
   */
  public async serve(body: unknown): Promise<WallAnswer> {
    return this.answer(WallRequests.read(body))
  }

  /**
   * Answers a request it has read
   * @param request The request
   * @returns The answer
   */
  private async answer(request: WallRequest): Promise<WallAnswer> {
    if (request.cmd === 'invalid') {
      return request.asked === 'PUT'
        ? NOT_POSTED
        : { s: false, e: 'unavailable' }
    }

    try {
      const ticket = await this.ticket(request.t)
      if (!ticket) return request.cmd === 'PUT' ? { PUT: BAD_TOKEN } : BAD_TOKEN

      const { holderGameId, ownerGameId } = ticket
      const own = holderGameId === ownerGameId

      switch (request.cmd) {
        case 'CHK':
          return { s: true, t: await this.walls.changedAt(ownerGameId) }
        case 'GET':
          return wallView(await this.walls.read(ownerGameId, holderGameId))
        case 'PUT':
          return await this.post(ticket, request)
        case 'DEL':
          return {
            s:
              POST_ID.test(request.x) &&
              (await this.walls.remove(ownerGameId, holderGameId, request.x)),
            e: '',
          }
        case 'GMB':
          return { s: true, r: await this.walls.hidden(holderGameId) }
        case 'AMB':
          if (!POST_ID.test(request.x)) return { s: false }
          await this.walls.hide(holderGameId, request.x)
          return { s: true }
        case 'CLW':
          if (own) await this.walls.clear(ownerGameId)
          return { s: own }
        case 'RMP':
          if (own) await this.walls.unhang(ownerGameId, request.mp)
          return { s: own }
        case 'ACK':
          await this.walls.acknowledge(
            holderGameId,
            request.x.filter((id) => POST_ID.test(id)),
          )
          return { s: true, e: '' }
      }
    } catch (error) {
      this.log.warn({ err: error, cmd: request.cmd }, 'wall request failed')

      return request.cmd === 'PUT'
        ? { PUT: { s: false, e: 'unavailable' } }
        : { s: false, e: 'unavailable' }
    }
  }

  /**
   * Posts on a wall
   * @param ticket The token's holder and wall
   * @param request The post
   * @returns The answer
   */
  private async post(
    ticket: WallTicket,
    request: PostRequest,
  ): Promise<WallAnswer> {
    const { holderGameId, ownerGameId } = ticket
    const message = request.m.replaceAll('%', '').trim().slice(0, LONGEST)

    if (message === '') return NOT_POSTED
    if (request.pp !== null && !POST_ID.test(request.pp)) return NOT_POSTED
    if (await this.moderation.muted(holderGameId)) return NOT_POSTED
    if (this.flooding(holderGameId)) return NOT_POSTED

    const post = await this.walls.post({
      wallGameId: ownerGameId,
      senderGameId: holderGameId,
      parentId: request.pp,
      message,
      patternId: WallService.clamp(request.s, 0, 1000),
      colorId: WallService.clamp(request.c, 0, 1000),
      localizationId: WallService.clamp(request.l, -1, 100),
      avatar: {
        ai: request.ai,
        ac: request.ac.slice(0, 3),
        ae: request.ae,
        ap: request.ap,
        aci: request.aci,
      },
    })
    if (!post) return NOT_POSTED

    return {
      PUT: { s: true },
      x: post.id,
      t: post.postedAt.getTime(),
      GET: wallView(await this.walls.read(ownerGameId, holderGameId)),
    }
  }

  /**
   * Reads a wall token
   * @param token The token
   * @returns What it is for, or null
   */
  private async ticket(token: string): Promise<WallTicket | null> {
    const ticket = await this.tokens.read(token)
    if (!ticket) return null

    const access = await this.walls.access(
      ticket.holderGameId,
      ticket.ownerGameId,
    )

    return access.read ? ticket : null
  }

  /**
   * Checks a player isn't posting too fast
   * @param gameId The player
   * @returns Whether they are
   */
  private flooding(gameId: number): boolean {
    const now = Date.now()
    const recent = (this.posted.get(gameId) ?? []).filter(
      (at) => now - at < MINUTE,
    )
    this.posted.set(gameId, recent)

    if (recent.length >= POSTS_A_MINUTE) return true

    recent.push(now)
    return false
  }

  /**
   * Holds a number between two others
   * @param value The number
   * @param least The least it may be
   * @param most The most it may be
   * @returns The number
   */
  private static clamp(value: number, least: number, most: number): number {
    return Math.min(most, Math.max(least, value))
  }
}
