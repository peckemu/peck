/**
 * The wall backgrounds
 */
const BACKGROUNDS: readonly (readonly [media: number, button: number])[] = [
  [3941, 3950],
  [3942, 3951],
  [3943, 3952],
  [3944, 3954],
  [3945, 3955],
  [3946, 3956],
  [3947, 3957],
  [3948, 3958],
  [3949, 3953],
  [3959, 3962],
  [3960, 3961],
  [3991, 3738],
  [3992, 2909],
  [3993, 3984],
  [3994, 3985],
  [3995, 3986],
  [3996, 3987],
  [3997, 3988],
  [3998, 3989],
  [3999, 3990],
  [4011, 4000],
  [4012, 4001],
  [4013, 4002],
  [4014, 4003],
  [4015, 4004],
  [4016, 4005],
  [4017, 4006],
  [4018, 4007],
  [4019, 4008],
  [4020, 4009],
  [4021, 4010],
  [4023, 4031],
  [4024, 4032],
  [4025, 4033],
  [4026, 4034],
  [4027, 4035],
  [4028, 4036],
  [4029, 4037],
  [4030, 4038],
  [4040, 4039],
  [6453, 6460],
  [6454, 6461],
  [6455, 6462],
  [6456, 6463],
  [6457, 6464],
  [6459, 6465],
]

/**
 * The wall stickers
 */
export const WALL_STICKERS: readonly number[] = [
  6265, 6266, 6267, 6268, 6269, 6270, 6271, 6281, 6282, 6283, 6284, 6285, 6286,
  6287, 6288, 6289, 6290, 6291, 6292, 6293, 6294, 6295, 6296, 6297, 6298, 6299,
  6300, 6301, 6302, 6303, 6304, 6305, 6306,
]

/**
 * The places a sticker goes
 */
export const STICKER_PLACES = 5

/**
 * The frames a masterpiece goes in
 */
export const WALL_FRAMES = 3

/**
 * The longest status line
 */
export const LONGEST_STATUS = 21

/**
 * The wall art lists
 */
export const WALL_ART_LISTS: ReadonlyMap<
  number,
  readonly { readonly media: number; readonly name: number }[]
> = new Map([
  [313, BACKGROUNDS.map(([, button]) => ({ media: button, name: 0 }))],
  [314, BACKGROUNDS.map(([media]) => ({ media, name: 0 }))],
  [646, WALL_STICKERS.map((media) => ({ media, name: 0 }))],
])

/**
 * A change to how a wall looks
 */
export type WallLook = {
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
  readonly stickers?: { readonly id: number; readonly pos: number }[]

  /**
   * Its masterpieces
   */
  readonly masterpieces?: { readonly iid: number; readonly sid: number }[]

  /**
   * Its photo booth picture
   */
  readonly photo?: Record<string, unknown> | null
}

/**
 * The most a photo may take up
 */
const MOST_PHOTO = 4096

/**
 * Checks for a plain object
 * @param value The value
 * @returns Whether it is
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Checks a wall's decoration
 * @class
 */
export class WallArt {
  /**
   * Checks a wall background
   * @param background Its place in the list
   * @returns Whether it is
   */
  public static isBackground(background: number): boolean {
    return (
      Number.isInteger(background) &&
      background >= 0 &&
      background < BACKGROUNDS.length
    )
  }

  /**
   * Checks a wall's stickers
   * @param stickers The stickers
   * @returns Whether they are
   */
  public static areStickers(
    stickers: readonly { readonly id: number; readonly pos: number }[],
  ): boolean {
    const places = new Set(stickers.map(({ pos }) => pos))
    if (places.size !== stickers.length) return false

    return stickers.every(
      ({ id, pos }) =>
        WALL_STICKERS.includes(id) && pos >= 0 && pos < STICKER_PLACES,
    )
  }

  /**
   * Reads the changes the client sends
   * @param json The changes
   * @returns The changes, or null
   */
  public static read(json: string): WallLook | null {
    let changes: unknown
    try {
      changes = JSON.parse(json)
    } catch {
      return null
    }
    if (!isRecord(changes)) return null

    const look: Record<string, unknown> = {}

    if ('bg' in changes) {
      if (
        typeof changes['bg'] !== 'number' ||
        !WallArt.isBackground(changes['bg'])
      ) {
        return null
      }
      look['background'] = changes['bg']
    }

    if ('tag' in changes) {
      const tag = changes['tag'] ?? ''
      if (typeof tag !== 'string') return null
      look['status'] = tag.replaceAll('%', '').trim().slice(0, LONGEST_STATUS)
    }

    if ('langId' in changes) {
      if (!Number.isInteger(changes['langId'])) return null
      look['langId'] = changes['langId']
    }

    if ('stk' in changes) {
      const stickers = WallArt.pairs(changes['stk'], 'id', 'pos')
      if (!stickers) return null

      const shaped = stickers.map(([id, pos]) => ({ id, pos }))
      if (!WallArt.areStickers(shaped)) return null
      look['stickers'] = shaped
    }

    if ('mp' in changes) {
      const frames = WallArt.pairs(changes['mp'], 'iid', 'sid')
      if (!frames) return null

      const shaped = frames.map(([iid, sid]) => ({ iid, sid }))
      if (new Set(shaped.map(({ sid }) => sid)).size !== shaped.length) {
        return null
      }
      if (
        shaped.some(({ iid, sid }) => iid < 0 || sid < 0 || sid >= WALL_FRAMES)
      ) {
        return null
      }
      look['masterpieces'] = shaped
    }

    if ('pb' in changes) {
      const photo = changes['pb']
      if (photo !== null && (!isRecord(photo) || !isRecord(photo['avatar']))) {
        return null
      }
      if (JSON.stringify(photo).length > MOST_PHOTO) return null
      look['photo'] = photo
    }

    return look
  }

  /**
   * Reads a list of number pairs
   * @param value The list
   * @param one The first key
   * @param other The second key
   * @returns The pairs, or null
   */
  private static pairs(
    value: unknown,
    one: string,
    other: string,
  ): [number, number][] | null {
    if (value === null) return []
    if (!Array.isArray(value) || value.length > 10) return null

    const pairs: [number, number][] = []
    for (const each of value as unknown[]) {
      if (each === null) continue
      if (!isRecord(each)) return null

      const first = each[one]
      const second = each[other]
      if (!Number.isInteger(first) || !Number.isInteger(second)) return null
      pairs.push([first as number, second as number])
    }

    return pairs
  }
}
