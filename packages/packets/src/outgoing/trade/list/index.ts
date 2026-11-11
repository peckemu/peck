import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'
import {
  type FramedDenItem,
  masterpieceFields,
} from '#packets/outgoing/masterpiece'
import { type ShownPet } from '#packets/outgoing/pet/list'

/**
 * Clothing on a trade list
 */
export type TradedClothing = {
  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its place in the inventory
   */
  readonly invId: number

  /**
   * Its colour
   */
  readonly color: number
}

/**
 * A den item on a trade list
 */
export type TradedDenItem = FramedDenItem & {
  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its place in the inventory
   */
  readonly invIdx: number

  /**
   * Which of its looks
   */
  readonly version: number
}

/**
 * A trade list's contents
 */
export type TradeListContents = {
  /**
   * Clothing
   */
  readonly clothing: readonly TradedClothing[]

  /**
   * Den items
   */
  readonly denItems: readonly TradedDenItem[]

  /**
   * Pets
   */
  readonly pets: readonly ShownPet[]
}

/**
 * A player's trade list
 * @class
 */
@Packet(Outgoing.TradeList, 'xt')
export class TradeListOutgoing extends OutgoingPacket {
  /**
   * Whose trade list
   */
  @Field.string() public readonly userName: string = ''

  /**
   * The list
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists a player's trade list
   * @param room The target room
   * @param userName Whose trade list
   * @param contents What is on it
   * @returns The packet
   */
  public static of(
    room: number,
    userName: string,
    contents: TradeListContents,
  ): TradeListOutgoing {
    const body = [
      String(contents.clothing.length),
      ...contents.clothing.flatMap((item) =>
        [item.defId, item.invId, item.color >>> 0].map(String),
      ),
      String(contents.denItems.length),
      ...contents.denItems.flatMap((item) => [
        String(item.defId),
        String(item.invIdx),
        String(item.version),
        ...masterpieceFields(item),
      ]),
      String(contents.pets.length),
      ...contents.pets.flatMap((pet) => [
        String(pet.lBits & 0xff),
        String(pet.invId),
        String(pet.createdTs),
        String(pet.lBits >>> 0),
        String(pet.uBits >>> 0),
        String(pet.eBits >>> 0),
        pet.name,
        String(pet.personalityDefId),
        String(pet.favoriteToyDefId),
        String(pet.favoriteFoodDefId),
      ]),
    ]

    return PacketFactory.create<TradeListOutgoing>(TradeListOutgoing, {
      room,
      userName,
      body,
    })
  }
}
