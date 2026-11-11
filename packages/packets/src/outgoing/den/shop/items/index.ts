import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Something on a den shop stand
 */
export type ShownListing = {
  /**
   * Den item 0, pet 1 or clothing 2
   */
  readonly itemKind: number

  /**
   * Its place in the owner's inventory
   */
  readonly invIdx: number

  /**
   * Gems 0 or diamonds 3
   */
  readonly currency: number

  /**
   * What it costs
   */
  readonly cost: number

  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its colour
   */
  readonly color: number

  /**
   * Which of its looks
   */
  readonly version: number
}

/**
 * Clothing
 */
const CLOTHING = 2

/**
 * A stand's stock
 * @class
 */
@Packet(Outgoing.DenShopItems, 'xt')
export class DenShopItemsOutgoing extends OutgoingPacket {
  /**
   * Always 1
   */
  @Field.int() public readonly found: number = 1

  /**
   * The listings
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists a stand's stock
   * @param room The target room
   * @param state The stand's state
   * @param listings What is on it
   * @param owner Whether the owner asks
   * @returns The packet
   */
  public static of(
    room: number,
    state: number,
    listings: readonly ShownListing[],
    owner: boolean,
  ): DenShopItemsOutgoing {
    const body = listings.flatMap((listing) => [
      ...DenShopItemsOutgoing.head(listing),
      ...(owner ? [] : DenShopItemsOutgoing.look(listing)),
    ])

    return PacketFactory.create<DenShopItemsOutgoing>(DenShopItemsOutgoing, {
      room,
      found: 1,
      body: [String(listings.length), String(state), ...body],
    })
  }

  /**
   * Says there is no such stand
   * @param room The target room
   * @returns The packet
   */
  public static missing(room: number): DenShopItemsOutgoing {
    return PacketFactory.create<DenShopItemsOutgoing>(DenShopItemsOutgoing, {
      room,
      found: 1,
      body: ['-1'],
    })
  }

  /**
   * Writes a listing's common fields
   * @param listing The listing
   * @returns The fields
   */
  public static head(listing: ShownListing): string[] {
    return [
      listing.currency,
      listing.cost,
      listing.itemKind,
      listing.invIdx,
      listing.defId,
    ].map(String)
  }

  /**
   * Writes a listing for viewers
   * @param listing The listing
   * @returns The fields
   */
  public static look(listing: ShownListing): string[] {
    if (listing.itemKind === CLOTHING) return [String(listing.color >>> 0)]

    return [String(listing.version), '1', '', '0', '']
  }
}
