/**
 * @sxip I may change this logo in the future. i like this one for now
 */

/**
 * An RGB colour
 */
export type Colour = readonly [number, number, number]

/**
 * The woodpecker pixel art
 */
export const WOODPECKER: readonly string[] = [
  '.....................dbbbbd',
  '..........rrkkk......bbdbbb',
  '.........rrrkkkkk.c..bbbbdb',
  '........rrrkkkkkkk.c.dbbbbb',
  '........rkkwwwwkkkk..bbdbbb',
  '........kkwwkwwkkkyyyybbbbd',
  '........kwwwwwwwkkkyyyybbbb',
  '........kkwwwwwwkkkc.bdbbbb',
  '.........kkkwwwwwk..cbbbbdb',
  '........kkkkkwwwwk...bbdbbb',
  '.......kkwkkkwwwwwk..dbbbbb',
  '.......kwkkwkkwwwwk..bbbbdb',
  '......kkkwkkwkwwwwkk.bbdbbb',
  '......kwkkwkkwwwwwwkybbbbbd',
  '......kkkwkkwkwwwwwkyybbbbb',
  '.....kkwkkwkkkwwwwwk.bbdbbb',
  '.....kkkwkkwkkwwwwk..dbbbbb',
  '.....kwkkwkkkkwwwwk..bbbbdb',
  '.....kkkkwkkkkwwwk..ybbdbbb',
  '......kkkkkkkkkwwk..yybbbbd',
  '.......kkkkkkkkkk....bbbbbb',
  '.......kkkkk.........bdbbbb',
  '.......kkkk..........bbbbdb',
  '........kkk..........bbdbbb',
  '........kk...........dbbbbb',
  '.........k...........bbbbdb',
  '.....................bbdbbb',
  '.....................bbbbbb',
]

/**
 * The peck logo
 */
export const WORD: readonly string[] = [
  '██████  ███████  ██████ ██   ██',
  '██   ██ ██      ██      ██  ██ ',
  '██████  █████   ██      █████  ',
  '██      ██      ██      ██  ██ ',
  '██      ███████  ██████ ██   ██',
]

/**
 * The line under the logo
 */
export const CREDIT = 'Animal Jam Classic emulator'

/**
 * Black
 */
export const BLACK: Colour = [35, 35, 45]

/**
 * White
 */
export const WHITE: Colour = [245, 245, 245]

/**
 * Crest red
 */
export const CREST: Colour = [225, 40, 60]

/**
 * The credit text colour
 */
export const GREY: Colour = [140, 140, 150]

/**
 * The pixel art palette
 */
export const PALETTE: Readonly<Record<string, Colour>> = {
  k: BLACK,
  w: WHITE,
  r: CREST,
  y: [240, 180, 60],
  b: [122, 78, 45],
  d: [90, 56, 32],
  c: [200, 150, 95],
}

/**
 * Gets the colour of a logo block
 * @param row The row of the block
 * @param column The column of the block
 * @returns The colour
 */
export const feather = (row: number, column: number): Colour =>
  (row + column) % 4 === 0 ? BLACK : WHITE
