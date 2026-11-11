import { deflateSync } from 'node:zlib'

import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * One bundled message
 */
export type BundledMessage = {
  /**
   * Its header
   */
  readonly header: string

  /**
   * Its fields
   */
  readonly fields: readonly string[]
}

/**
 * Several adventure messages
 * @class
 */
@Packet(Outgoing.QuestBundle, 'xt')
export class QuestBundleOutgoing extends OutgoingPacket {
  /**
   * The packed messages
   */
  @Field.string() public readonly payload: string = ''

  /**
   * Packs messages
   * @param room The target room
   * @param messages The messages
   * @returns The packet
   */
  public static of(
    room: number,
    messages: readonly BundledMessage[],
  ): QuestBundleOutgoing {
    const parts = [QuestBundleOutgoing.short(messages.length)]
    for (const { header, fields } of messages) {
      parts.push(QuestBundleOutgoing.short(fields.length + 1))
      for (const text of [header, ...fields]) {
        parts.push(QuestBundleOutgoing.utf(text))
      }
    }

    const payload = deflateSync(Buffer.concat(parts)).toString('base64')

    return PacketFactory.create<QuestBundleOutgoing>(QuestBundleOutgoing, {
      room,
      payload,
    })
  }

  /**
   * Writes a short
   * @param value The value
   * @returns The bytes
   */
  private static short(value: number): Buffer {
    const bytes = Buffer.alloc(2)
    bytes.writeInt16BE(value)
    return bytes
  }

  /**
   * Writes a string with its length
   * @param text The text
   * @returns The bytes
   */
  private static utf(text: string): Buffer {
    const bytes = Buffer.from(text, 'utf8')
    const length = Buffer.alloc(2)
    length.writeUInt16BE(bytes.length)
    return Buffer.concat([length, bytes])
  }
}
