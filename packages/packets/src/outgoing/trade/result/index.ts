import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'
import { masterpieceFields } from '#packets/outgoing/masterpiece'
import { type ShownPet } from '#packets/outgoing/pet/list'
import {
  type TradedClothing,
  type TradedDenItem,
} from '#packets/outgoing/trade/list'

/**
 * What happened to a trade
 */
export const TradeStatus = {
  /**
   * Someone offers a trade
   */
  Offer: 0,

  /**
   * Accepted or done
   */
  Accepted: 1,

  /**
   * Declined
   */
  Denied: 2,

  /**
   * The item is gone
   */
  Gone: 3,

  /**
   * They can't trade right now
   */
  Busy: 4,

  /**
   * Their inventory is full
   */
  Full: 5,

  /**
   * The trade closed
   */
  Closed: 6,

  /**
   * They are in another world
   */
  Elsewhere: 7,

  /**
   * The pet is out
   */
  PetInUse: 9,
} as const

export type TradeStatus = (typeof TradeStatus)[keyof typeof TradeStatus]

/**
 * Something received in a trade
 */
export type ReceivedItem =
  | { readonly type: 'clothing'; readonly item: TradedClothing }
  | { readonly type: 'den-item'; readonly item: TradedDenItem }
  | { readonly type: 'pet'; readonly pet: ShownPet }

/**
 * Something given away in a trade
 */
export type GivenItem = {
  /**
   * Clothing 0, den item 1 or pet 2
   */
  readonly type: number

  /**
   * Its place in the giver's inventory
   */
  readonly invIdx: number
}

/**
 * What a trade offers
 */
export type TradeOffer = {
  /**
   * The player offering
   */
  readonly userName: string

  /**
   * The wanted thing
   */
  readonly wantedKind: number

  /**
   * Its place in the owner's inventory
   */
  readonly wantedInvIdx: number

  /**
   * The clothing offered
   */
  readonly clothing: readonly TradedClothing[]

  /**
   * The den items offered
   */
  readonly denItems: readonly TradedDenItem[]

  /**
   * The pets offered
   */
  readonly pets: readonly ShownPet[]
}

/**
 * What happened to a trade
 * @class
 */
@Packet(Outgoing.Trade, 'xt')
export class TradeOutgoing extends OutgoingPacket {
  /**
   * What happened
   */
  @Field.int() public readonly status: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Offers a trade
   * @param offer The offer
   * @returns The packet
   */
  public static offer(offer: TradeOffer): TradeOutgoing {
    return TradeOutgoing.build(TradeStatus.Offer, [
      offer.userName,
      '1',
      String(offer.wantedKind),
      String(offer.wantedInvIdx),
      String(offer.clothing.length),
      String(offer.denItems.length),
      String(offer.pets.length),
      ...offer.clothing.flatMap((item) => [
        String(item.defId),
        String(item.color >>> 0),
      ]),
      ...offer.denItems.flatMap((item) => [
        String(item.defId),
        String(item.version),
        ...masterpieceFields(item),
      ]),
      ...offer.pets.flatMap((pet) => [
        String(pet.createdTs),
        String(pet.lBits & 0xff),
        String(pet.invId),
        String(pet.lBits >>> 0),
        String(pet.uBits >>> 0),
        String(pet.eBits >>> 0),
        String(pet.personalityDefId),
        String(pet.favoriteToyDefId),
        String(pet.favoriteFoodDefId),
        pet.name,
      ]),
    ])
  }

  /**
   * Says the trade was accepted
   * @returns The packet
   */
  public static accepted(): TradeOutgoing {
    return TradeOutgoing.build(TradeStatus.Accepted, ['0'])
  }

  /**
   * Says the trade is done
   * @param received What the player got
   * @param given What the player gave
   * @returns The packet
   */
  public static done(
    received: readonly ReceivedItem[],
    given: readonly GivenItem[],
  ): TradeOutgoing {
    return TradeOutgoing.build(TradeStatus.Accepted, [
      '1',
      String(received.length),
      ...received.flatMap((entry) => TradeOutgoing.received(entry)),
      String(given.length),
      ...given.flatMap(({ type, invIdx }) => [String(type), String(invIdx)]),
    ])
  }

  /**
   * Says why a trade didn't happen
   * @param status Why
   * @param userName The subject
   * @returns The packet
   */
  public static refused(status: TradeStatus, userName: string): TradeOutgoing {
    return TradeOutgoing.build(status, [userName, '1'])
  }

  /**
   * Closes the trade without a message
   * @returns The packet
   */
  public static closed(): TradeOutgoing {
    return TradeOutgoing.build(TradeStatus.Closed, [])
  }

  /**
   * Refuses a cross world trade
   * @param roomName Their room
   * @returns The packet
   */
  public static elsewhere(roomName: string): TradeOutgoing {
    return TradeOutgoing.build(TradeStatus.Elsewhere, [roomName])
  }

  /**
   * Writes something received
   * @param entry The received entry
   * @returns The fields
   */
  private static received(entry: ReceivedItem): string[] {
    if (entry.type === 'clothing') {
      const { item } = entry

      return [
        '0',
        String(item.defId),
        String(item.invId),
        String(item.color >>> 0),
      ]
    }

    if (entry.type === 'den-item') {
      const { item } = entry

      return [
        '1',
        String(item.invIdx),
        String(item.defId),
        String(item.version),
        ...masterpieceFields(item),
      ]
    }

    const { pet } = entry

    return [
      '2',
      String(pet.createdTs),
      String(pet.invId),
      String(pet.lBits & 0xff),
      String(pet.lBits >>> 0),
      String(pet.uBits >>> 0),
      String(pet.eBits >>> 0),
      String(pet.personalityDefId),
      String(pet.favoriteToyDefId),
      String(pet.favoriteFoodDefId),
      pet.name,
    ]
  }

  /**
   * Builds the packet
   * @param status What happened
   * @param body The rest
   * @returns The packet
   */
  private static build(status: number, body: readonly string[]): TradeOutgoing {
    return PacketFactory.create<TradeOutgoing>(TradeOutgoing, {
      room: -1,
      status,
      body,
    })
  }
}
