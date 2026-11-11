import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'
import {
  type FramedDenItem,
  shownMasterpiece,
} from '#packets/outgoing/masterpiece'
import { type ShownPet } from '#packets/outgoing/pet/list'

/**
 * A den item placed in the den
 */
export type PlacedDenItem = FramedDenItem & {
  /**
   * Its place in the owner's den items
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
   * Where it stands across
   */
  readonly x: number

  /**
   * Where it stands down
   */
  readonly y: number

  /**
   * Its drawn look
   */
  readonly version: number

  /**
   * Whether it is flipped
   */
  readonly flipped: boolean

  /**
   * The den door's owner
   */
  readonly userNameLink: string

  /**
   * Whether it is a mannequin
   */
  readonly mannequin: boolean

  /**
   * Its eco switch
   */
  readonly ecoConsumerState?: number | undefined
}

/**
 * A pet in the den
 */
export type DenPet = ShownPet & {
  /**
   * Its place, or 0
   */
  readonly denCategoryId: number

  /**
   * Where it stands across
   */
  readonly denX: number

  /**
   * Where it stands down
   */
  readonly denY: number

  /**
   * How it is flipped
   */
  readonly denFlipped: number
}

/**
 * A bare mannequin
 */
const BARE_MANNEQUIN = Array<string>(10).fill('0')

/**
 * The den's placed items
 * @class
 */
@Packet(Outgoing.DenState, 'xt')
export class DenStateOutgoing extends OutgoingPacket {
  /**
   * How many items follow
   */
  @Field.int() public readonly itemCount: number = 0

  /**
   * How many pets follow the items
   */
  @Field.int() public readonly petCount: number = 0

  /**
   * 1 to load the den again
   */
  @Field.string() public readonly forceReload: string = '0'

  /**
   * The items and pets
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Says where den items stand
   * @param room The den's id
   * @param items The placed and stored items
   * @param pets The pets
   * @returns The packet
   */
  public static of(
    room: number,
    items: readonly PlacedDenItem[],
    pets: readonly DenPet[] = [],
  ): DenStateOutgoing {
    const body = items.flatMap((item) => {
      const placed = item.categoryId !== 0

      return [
        String(item.invIdx),
        String(item.defId),
        placed ? '1' : '0',
        String(placed ? item.x : 0),
        String(placed ? item.y : 0),
        String(item.version),
        placed && item.flipped ? '1' : '0',
        item.userNameLink,
        ...shownMasterpiece(item),
        ...(item.mannequin ? BARE_MANNEQUIN : []),
        String(item.ecoConsumerState ?? 0),
      ]
    })

    return PacketFactory.create<DenStateOutgoing>(DenStateOutgoing, {
      room,
      itemCount: items.length,
      petCount: pets.length,
      forceReload: '0',
      body: [...body, ...pets.flatMap((pet) => DenStateOutgoing.pet(pet))],
    })
  }

  /**
   * Writes a pet in the den
   * @param pet The pet
   * @returns The fields
   */
  private static pet(pet: DenPet): string[] {
    return [
      String(pet.invId),
      String(pet.lBits >>> 0),
      String(pet.uBits >>> 0),
      String(pet.eBits >>> 0),
      String(pet.denCategoryId),
      String(pet.denX),
      String(pet.denY),
      String(pet.denFlipped),
      String(pet.createdTs),
      String(pet.personalityDefId),
      String(pet.favoriteToyDefId),
      String(pet.favoriteFoodDefId),
      pet.name,
    ]
  }
}
