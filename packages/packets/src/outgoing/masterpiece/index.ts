import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A masterpiece on a den item
 */
export type ListedMasterpiece = {
  /**
   * Its id
   */
  readonly uniqueImageId: string

  /**
   * Whether staff approved it
   */
  readonly approved: boolean

  /**
   * The painter
   */
  readonly creatorGameId: number

  /**
   * The painter's uuid
   */
  readonly creatorUuid: string
}

/**
 * A den item
 */
export type FramedDenItem = {
  /**
   * The masterpiece it holds
   */
  readonly masterpiece?: ListedMasterpiece | undefined
}

/**
 * Writes a den item's masterpiece
 * @param item The den item
 * @returns The fields
 */
export const masterpieceFields = (item: FramedDenItem): string[] => {
  const art = item.masterpiece
  if (!art) return ['true', '', '0', '']

  return [
    art.approved ? 'true' : 'false',
    art.uniqueImageId,
    String(art.creatorGameId),
    art.creatorUuid,
  ]
}

/**
 * Writes a masterpiece for viewers
 * @param item The den item
 * @returns The fields
 */
export const shownMasterpiece = (item: FramedDenItem): string[] => {
  const art = item.masterpiece
  if (!art?.approved) return ['', '0', '']

  return [art.uniqueImageId, String(art.creatorGameId), art.creatorUuid]
}

/**
 * A masterpiece in a den
 */
export type DenMasterpiece = FramedDenItem & {
  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its place in the owner's den items
   */
  readonly invIdx: number

  /**
   * Its frame
   */
  readonly version: number
}

/**
 * The masterpieces in a den
 * @class
 */
@Packet(Outgoing.DenMasterpieces, 'xt')
export class DenMasterpiecesOutgoing extends OutgoingPacket {
  /**
   * How many
   */
  @Field.int() public readonly count: number = 0

  /**
   * The masterpieces
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists a den's masterpieces
   * @param room The room
   * @param items The masterpieces
   * @returns The packet
   */
  public static of(
    room: number,
    items: readonly DenMasterpiece[],
  ): DenMasterpiecesOutgoing {
    const body = items.flatMap((item) => {
      const [, ...shown] = masterpieceFields(item)

      return [
        String(item.defId),
        String(item.invIdx),
        String(item.version),
        item.masterpiece?.approved ? '1' : '',
        ...shown,
      ]
    })

    return PacketFactory.create<DenMasterpiecesOutgoing>(
      DenMasterpiecesOutgoing,
      {
        room,
        count: items.length,
        body,
      },
    )
  }
}

/**
 * Who painted a masterpiece
 * @class
 */
@Packet(Outgoing.MasterpieceCreator, 'xt')
export class MasterpieceCreatorOutgoing extends OutgoingPacket {
  /**
   * Their username
   */
  @Field.string() public readonly creatorName: string = ''
}
