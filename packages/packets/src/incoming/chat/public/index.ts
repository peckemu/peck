import { type ChatKind, ChatKind as Kind, isChatKind } from '@peck/shared'

import { Field, IncomingPacket, Packet, XmlEntities } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * The raw text
 */
const written = Field.string({ path: 'txt' })

/**
 * The kinds with an extra value
 */
const WITH_EXTRA: ReadonlySet<number> = new Set([Kind.Action, Kind.CustomPvp])

/**
 * A chat message split into its parts
 */
type Parts = {
  /**
   * What was said
   */
  readonly text: string

  /**
   * How it was made
   */
  readonly kind: number

  /**
   * The value
   */
  readonly extra: string
}

/**
 * Splits a chat message
 * @param written The text
 * @returns The parts, or null
 */
const split = (written: string): Parts | null => {
  const parts = written.split('%')
  if (parts.length < 2) return null

  const last = parts.at(-1) ?? ''
  const before = Number(parts.at(-2))

  if (parts.length >= 3 && /^-?\d+$/.test(last) && WITH_EXTRA.has(before)) {
    return { text: parts.slice(0, -2).join('%'), kind: before, extra: last }
  }

  return { text: parts.slice(0, -1).join('%'), kind: Number(last), extra: '' }
}

/**
 * A public chat message
 * @class
 */
@Packet(Incoming.PublicChat, 'xml')
export class PublicChatIncoming extends IncomingPacket {
  /**
   * The decoded text
   */
  @Field.map(written, {
    read: (text, fail) => {
      const parts = split(text)
      return parts ? XmlEntities.decode(parts.text) : fail('has no kind')
    },
  })
  public readonly text: string = ''

  /**
   * How the message was made
   */
  @Field.map(written, {
    read: (text, fail) => {
      const kind = split(text)?.kind ?? -1
      return isChatKind(kind) ? kind : fail('has an unknown kind')
    },
  })
  public readonly kind: ChatKind = 0

  /**
   * The value
   */
  @Field.map(written, { read: (text) => split(text)?.extra ?? '' })
  public readonly extra: string = ''
}
