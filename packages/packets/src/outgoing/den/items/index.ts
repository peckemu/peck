import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'
import {
  type FramedDenItem,
  masterpieceFields,
} from '#packets/outgoing/masterpiece'

/**
 * A den item the player owns
 */
export type ListedDenItem = FramedDenItem & {
  /**
   * Its place in the player's den items
   */
  readonly invIdx: number

  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its layer, or 0
   */
  readonly categoryId: number

  /**
   * Its drawn look
   */
  readonly version: number

  /**
   * The den shop listing, or 0
   */
  readonly denStoreInvIdx: number
}

/**
 * A bare mannequin
 */
const BARE_MANNEQUIN = Array<string>(10).fill('0')

/**
 * The player's den items
 * @class
 */
@Packet(Outgoing.DenItems, 'xt')
export class DenItemsOutgoing extends OutgoingPacket {
  /**
   * The den room in use
   */
  @Field.int() public readonly activeDenIdx: number = 0

  /**
   * How many items follow
   */
  @Field.int() public readonly itemCount: number = 0

  /**
   * How many placed pets follow the items
   */
  @Field.int() public readonly petCount: number = 0

  /**
   * The items and placed pets
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists the player's den items
   * @param room The target room
   * @param activeDenIdx The den room in use
   * @param items The items
   * @param isMannequin The mannequin check
   * @param pets The pets placed in the den
   * @returns The packet
   */
  public static of(
    room: number,
    activeDenIdx: number,
    items: readonly ListedDenItem[],
    isMannequin: (defId: number) => boolean,
    pets: readonly number[] = [],
  ): DenItemsOutgoing {
    const body = items.flatMap((item) => [
      String(item.invIdx),
      String(item.defId),
      String(item.categoryId),
      String(item.version),
      ...masterpieceFields(item),
      ...(isMannequin(item.defId) ? BARE_MANNEQUIN : []),
      String(item.denStoreInvIdx),
    ])

    return PacketFactory.create<DenItemsOutgoing>(DenItemsOutgoing, {
      room,
      activeDenIdx,
      itemCount: items.length,
      petCount: pets.length,
      body: [...body, ...pets.map(String)],
    })
  }
}
