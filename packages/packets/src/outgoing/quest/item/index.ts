import { QuestPickUpResult } from '@peck/shared'

import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * An item a player moved
 */
export type MovedItem = {
  /**
   * The item
   */
  readonly actorId: string

  /**
   * Its inner radius
   */
  readonly innerRadius: number

  /**
   * Its outer radius
   */
  readonly outerRadius: number

  /**
   * Where across
   */
  readonly x: number

  /**
   * Where down
   */
  readonly y: number
}

/**
 * Where items were moved
 * @class
 */
@Packet(Outgoing.QuestMovedItems, 'xt')
export class QuestMovedItemsOutgoing extends OutgoingPacket {
  /**
   * The items
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists the moved items
   * @param room The target room
   * @param items The items
   * @returns The packet
   */
  public static of(
    room: number,
    items: readonly MovedItem[],
  ): QuestMovedItemsOutgoing {
    const body = items.flatMap((item) => [
      item.actorId,
      ...[item.innerRadius, item.outerRadius, item.x, item.y].map(String),
    ])

    return PacketFactory.create<QuestMovedItemsOutgoing>(
      QuestMovedItemsOutgoing,
      {
        room,
        body,
      },
    )
  }
}

/**
 * What a pick up came to
 * @class
 */
@Packet(Outgoing.QuestPickUp, 'xt')
export class QuestPickUpOutgoing extends OutgoingPacket {
  /**
   * The result
   */
  @Field.int() public readonly result: number = QuestPickUpResult.Refused

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Says the player already carries something
   * @param room The target room
   * @param heldItem The item carried
   * @returns The packet
   */
  public static holding(room: number, heldItem: string): QuestPickUpOutgoing {
    return PacketFactory.create<QuestPickUpOutgoing>(QuestPickUpOutgoing, {
      room,
      result: QuestPickUpResult.Holding,
      body: [heldItem],
    })
  }

  /**
   * Says an item was picked up
   * @param room The target room
   * @param actorId The item
   * @param userId The player's session id
   * @returns The packet
   */
  public static pickedUp(
    room: number,
    actorId: string,
    userId: number,
  ): QuestPickUpOutgoing {
    return PacketFactory.create<QuestPickUpOutgoing>(QuestPickUpOutgoing, {
      room,
      result: QuestPickUpResult.PickedUp,
      body: [actorId, String(userId)],
    })
  }

  /**
   * Refuses a pick up
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): QuestPickUpOutgoing {
    return PacketFactory.create<QuestPickUpOutgoing>(QuestPickUpOutgoing, {
      room,
      result: QuestPickUpResult.Refused,
      body: [],
    })
  }

  /**
   * Says an item was put down
   * @param room The target room
   * @param actorId The item
   * @param userId The player's session id
   * @param x Where across
   * @param y Where down
   * @returns The packet
   */
  public static dropped(
    room: number,
    actorId: string,
    userId: number,
    x: number,
    y: number,
  ): QuestPickUpOutgoing {
    return PacketFactory.create<QuestPickUpOutgoing>(QuestPickUpOutgoing, {
      room,
      result: QuestPickUpResult.Dropped,
      body: [actorId, ...[userId, x, y].map(String)],
    })
  }
}

/**
 * Hands a player an item
 * @class
 */
@Packet(Outgoing.QuestGiveItem, 'xt')
export class QuestGiveItemOutgoing extends OutgoingPacket {
  /**
   * The item
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * Hands over an item
   * @param room The target room
   * @param actorId The item
   * @returns The packet
   */
  public static of(room: number, actorId: string): QuestGiveItemOutgoing {
    return PacketFactory.create<QuestGiveItemOutgoing>(QuestGiveItemOutgoing, {
      room,
      actorId,
    })
  }
}
