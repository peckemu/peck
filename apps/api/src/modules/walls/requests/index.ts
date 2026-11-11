/**
 * An incoming post
 */
export type PostRequest = {
  /**
   * The command
   */
  readonly cmd: 'PUT'

  /**
   * The token
   */
  readonly t: string

  /**
   * The look behind the words
   */
  readonly s: number

  /**
   * The colour behind the words
   */
  readonly c: number

  /**
   * What it says
   */
  readonly m: string

  /**
   * The poster's animal
   */
  readonly ai: number

  /**
   * Its colours
   */
  readonly ac: number[]

  /**
   * Its eyes
   */
  readonly ae: number

  /**
   * Its pattern
   */
  readonly ap: number

  /**
   * Its custom animal
   */
  readonly aci: number

  /**
   * The poster's language
   */
  readonly l: number

  /**
   * The parent post, or null
   */
  readonly pp: string | null
}

/**
 * A request to the wall service
 */
export type WallRequest =
  | { readonly cmd: 'CHK' | 'GET' | 'GMB' | 'CLW'; readonly t: string }
  | { readonly cmd: 'DEL' | 'AMB'; readonly t: string; readonly x: string }
  | { readonly cmd: 'RMP'; readonly t: string; readonly mp: number[] }
  | { readonly cmd: 'ACK'; readonly t: string; readonly x: string[] }
  | PostRequest
  | { readonly cmd: 'invalid'; readonly asked: string | null }

/**
 * What a post id looks like
 */
export const POST_ID =
  /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/

/**
 * A post's number fields
 */
const NUMBERS = ['s', 'c', 'ai', 'ae', 'ap', 'aci', 'l'] as const

/**
 * Reads wall requests
 * @class
 */
export class WallRequests {
  /**
   * Reads a request's body
   * @param body The body
   * @returns The request
   */
  public static read(body: unknown): WallRequest {
    if (!WallRequests.isRecord(body)) return { cmd: 'invalid', asked: null }

    const asked = typeof body['cmd'] === 'string' ? body['cmd'] : null
    const invalid = { cmd: 'invalid', asked } as const
    const t = WallRequests.text(body['t'], 200)
    if (asked === null || t === null) return invalid

    if (
      asked === 'CHK' ||
      asked === 'GET' ||
      asked === 'GMB' ||
      asked === 'CLW'
    ) {
      return { cmd: asked, t }
    }

    if (asked === 'DEL' || asked === 'AMB') {
      const x = WallRequests.text(body['x'], 64)
      return x === null ? invalid : { cmd: asked, t, x }
    }

    if (asked === 'RMP') {
      const mp = WallRequests.list(body['mp'], 10, (each) =>
        WallRequests.whole(each),
      )
      return mp === null ? invalid : { cmd: 'RMP', t, mp }
    }

    if (asked === 'ACK') {
      const x = WallRequests.list(body['x'], 50, (each) =>
        WallRequests.text(each, 64),
      )
      return x === null ? invalid : { cmd: 'ACK', t, x }
    }

    if (asked === 'PUT') return WallRequests.post(body, t) ?? invalid

    return invalid
  }

  /**
   * Reads a post
   * @param body The body
   * @param t The token
   * @returns The post, or null
   */
  private static post(
    body: Record<string, unknown>,
    t: string,
  ): PostRequest | null {
    const numbers = NUMBERS.map((key) => WallRequests.whole(body[key]))
    const m = WallRequests.text(body['m'], 500)
    const ac = WallRequests.list(body['ac'] ?? [], 4, (each) =>
      WallRequests.colour(each),
    )
    const pp =
      body['pp'] === undefined || body['pp'] === null
        ? ''
        : WallRequests.text(body['pp'], 64)
    if (numbers.includes(null) || m === null || ac === null || pp === null) {
      return null
    }

    const [s = 0, c = 0, ai = 0, ae = 0, ap = 0, aci = 0, l = 0] =
      numbers as number[]

    return {
      cmd: 'PUT',
      t,
      s,
      c,
      m,
      ai,
      ac,
      ae,
      ap,
      aci,
      l,
      pp: pp === '' ? null : pp,
    }
  }

  /**
   * Reads a list
   * @param value The list
   * @param most The most it may hold
   * @param read Reads each entry
   * @returns The entries, or null
   */
  private static list<T>(
    value: unknown,
    most: number,
    read: (each: unknown) => T | null,
  ): T[] | null {
    if (!Array.isArray(value) || value.length > most) return null

    const entries = (value as unknown[]).map(read)

    return entries.every((each) => each !== null) ? entries : null
  }

  /**
   * Reads a colour
   * @param value The value
   * @returns The colour, or null
   */
  private static colour(value: unknown): number | null {
    const colour = WallRequests.whole(value)

    return colour !== null && colour >= 0 && colour <= 0xffffffff
      ? colour
      : null
  }

  /**
   * Reads a whole number
   * @param value The value
   * @returns The number, or null
   */
  private static whole(value: unknown): number | null {
    const number =
      typeof value === 'string' && value.trim() !== '' ? Number(value) : value

    return typeof number === 'number' && Number.isSafeInteger(number)
      ? number
      : null
  }

  /**
   * Reads some text
   * @param value The value
   * @param most The longest it may be
   * @returns The text, or null
   */
  private static text(value: unknown, most: number): string | null {
    return typeof value === 'string' && value.length <= most ? value : null
  }

  /**
   * Checks a value is a plain object
   * @param value The value
   * @returns Whether it is
   */
  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}
