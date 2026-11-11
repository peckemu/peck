import {
  type Colour,
  CREDIT,
  feather,
  GREY,
  PALETTE,
  WOODPECKER,
  WORD,
} from '#banner/art'

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
 * Draws the woodpecker
 * @returns The lines to print
 */
const drawWoodpecker = (): string[] =>
  Array.from({ length: WOODPECKER.length / 2 }, (_, line) => {
    const top = WOODPECKER[line * 2] ?? ''
    const bottom = WOODPECKER[line * 2 + 1] ?? ''

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
  const name = WORD.map((line, row) =>
    Array.from(line, (char, column) => paint(char, feather(row, column))).join(
      '',
    ),
  )

  return [...name, '', paint(CREDIT, GREY)]
}

/**
 * Prints the startup banner
 */
export const printBanner = (): void => {
  const art = colourful() ? drawWoodpecker() : []
  const name = drawName()
  const top = Math.max(0, Math.floor((art.length - name.length) / 2))
  const blank = ' '.repeat(art.length > 0 ? (WOODPECKER[0]?.length ?? 0) : 0)

  const lines = Array.from(
    { length: Math.max(art.length, name.length) },
    (_, row) => `  ${art[row] ?? blank}   ${name[row - top] ?? ''}`.trimEnd(),
  )

  process.stdout.write(`\n${lines.join('\n')}\n\n`)
}
