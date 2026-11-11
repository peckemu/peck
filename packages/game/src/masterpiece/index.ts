/**
 * A frame a masterpiece can hang in
 */
export type MasterpieceFrame = {
  /**
   * Its media id
   */
  readonly media: number

  /**
   * Its name's string id
   */
  readonly name: number
}

/**
 * Every frame
 */
export const MASTERPIECE_FRAMES: readonly MasterpieceFrame[] = [
  { media: 4815, name: 25176 },
  { media: 4816, name: 25175 },
  { media: 4814, name: 25177 },
  { media: 4813, name: 25174 },
  { media: 4851, name: 25308 },
  { media: 4888, name: 25306 },
  { media: 4892, name: 25307 },
  { media: 4941, name: 25305 },
  { media: 5688, name: 28858 },
  { media: 5733, name: 29009 },
  { media: 5780, name: 29304 },
  { media: 5948, name: 29967 },
  { media: 5949, name: 29968 },
  { media: 6075, name: 30265 },
  { media: 6077, name: 30266 },
  { media: 6170, name: 30375 },
  { media: 6921, name: 31954 },
  { media: 7139, name: 32409 },
  { media: 7164, name: 32479 },
  { media: 7186, name: 32594 },
  { media: 7232, name: 32663 },
  { media: 7254, name: 32753 },
  { media: 7277, name: 32754 },
  { media: 7324, name: 32755 },
]

/**
 * The frame lists
 */
export const MASTERPIECE_FRAME_LISTS: ReadonlyMap<
  number,
  readonly MasterpieceFrame[]
> = new Map([
  [416, [...MASTERPIECE_FRAMES].reverse()],
  [424, MASTERPIECE_FRAMES],
])
