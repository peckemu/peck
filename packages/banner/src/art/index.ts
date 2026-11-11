/**
 * An RGB colour
 */
export type Colour = readonly [number, number, number]

/**
 * The blossom tree pixel art
 */
export const TREE: readonly string[] = [
  '..s.................t...',
  '.......DPPD...DPPD......',
  '....t.DPLLPDDPPLLPD..s..',
  '.....DPLLLPPPPPLLPPD....',
  '..DPPDPPPPPPPPPPPPPPD...',
  '.DPLLPPPPLLPPPPPPLLPPD..',
  '.RPLLPPPPLLLPPPPPLLLPD..',
  '.DPPPPDPPPPPPPDPPPPPPD..',
  '..DPPD.DPPPPPPDDPPPPD...',
  '...DD...DDPPDBB.DPPD..t.',
  '.t.........DBB...DD.....',
  '...........BB...........',
  '..........BB.......s....',
  '..........BB............',
  '.....s....BB............',
  '..........BBB...........',
  '........gGGGBGg.........',
  '......gGGGGGGGGGg.......',
  '....gGGGGGGGGGGGGGg.....',
  '..gggGGGGGGGGGGGGGGggg..',
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
export const CREDIT = 'ANIMAL JAM CLASSIC EMULATOR'

/**
 * The logo's rows, lightest first
 */
export const GRADIENT: readonly Colour[] = [
  [244, 242, 255],
  [222, 214, 248],
  [200, 186, 240],
  [176, 158, 230],
  [152, 130, 218],
]

/**
 * The logo's shadow
 */
export const SHADOW: Colour = [79, 45, 128]

/**
 * The credit text colour
 */
export const CREDIT_COLOUR: Colour = [163, 184, 236]

/**
 * The pixel art palette
 */
export const PALETTE: Readonly<Record<string, Colour>> = {
  P: [134, 85, 189],
  L: [196, 156, 230],
  D: [79, 45, 128],
  R: [138, 160, 224],
  B: [58, 42, 74],
  G: [41, 77, 54],
  g: [28, 58, 42],
  s: [238, 242, 255],
  t: [95, 124, 196],
}

/**
 * Gets the colour of a logo row
 * @param row The row
 * @returns The colour
 */
export const shade = (row: number): Colour =>
  GRADIENT[row] ?? GRADIENT[GRADIENT.length - 1] ?? [255, 255, 255]
