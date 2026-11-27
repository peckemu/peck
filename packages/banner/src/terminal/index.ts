import {
  type Colour,
  CREDIT,
  CREDIT_COLOUR,
  PALETTE,
  shade,
  SHADOW,
  TREE,
  WORD,
} from '../art/index.ts'

/**
 * Checks the terminal takes colours
 * @returns Whether it does
 */
const colourful = (): boolean =>
  !Bun.env['NO_COLOR'] &&
  Bun.env['TERM'] !== 'dumb' &&
  Bun.env.NODE_ENV !== 'production'

/**
 * Colours text for the terminal
 * @param text The text to colour
 * @param colour The foreground colour
 * @param background The background colour
 * @returns The coloured text
 */
const paint = (text: string, colour: Colour, background?: Colour): string => {
  if (!colourful()) return text

  const back = background ? `\x1b[48;2;${background.join(';')}m` : ''

  return `\x1b[38;2;${colour.join(';')}m${back}${text}\x1b[0m`
}

/**
 * Draws the tree
 * @returns The lines to print
 */
const drawTree = (): string[] =>
  Array.from({ length: TREE.length / 2 }, (_, line) => {
    const top = TREE[line * 2] ?? ''
    const bottom = TREE[line * 2 + 1] ?? ''

    return Array.from(top, (letter, column) => {
      const upper = PALETTE[letter]
      const lower = PALETTE[bottom.charAt(column)]
      if (upper && lower) return paint('▀', upper, lower)
      if (upper) return paint('▀', upper)
      if (lower) return paint('▄', lower)
      return ' '
    }).join('')
  })

/**
 * Draws the logo and credit
 * @returns The lines to print
 */
const drawName = (): string[] => {
  const name = [...WORD, ''].map((line, row) =>
    Array.from({ length: line.length + 1 }, (_, column) => {
      if (line.charAt(column) === '█') return paint('█', shade(row))

      const above = WORD[row - 1]?.charAt(column - 1)
      return above === '█' && colourful() ? paint('█', SHADOW) : ' '
    }).join(''),
  )

  return [...name, paint(Array.from(CREDIT).join(' '), CREDIT_COLOUR)]
}

/**
 * Prints the startup banner
 */
export const printBanner = (): void => {
  const art = colourful() ? drawTree() : []
  const name = drawName()
  const top = Math.max(0, Math.floor((art.length - name.length) / 2))
  const blank = ' '.repeat(art.length > 0 ? (TREE[0]?.length ?? 0) : 0)

  const lines = Array.from(
    { length: Math.max(art.length, name.length) },
    (_, row) => `  ${art[row] ?? blank}   ${name[row - top] ?? ''}`.trimEnd(),
  )

  process.stdout.write(`\n${lines.join('\n')}\n\n`)
}
