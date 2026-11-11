import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The listed player
 */
export type ItemOwner = {
  /**
   * The player's username
   */
  readonly username: string
}

/**
 * The listed avatar
 */
export type ItemAvatar = {
  /**
   * Its id among the player's avatars
   */
  readonly perUserId: number

  /**
   * The eyes it wears
   */
  readonly eyesDefId: number

  /**
   * Its pattern, or 0
   */
  readonly patternDefId: number
}

/**
 * An item in a list
 */
export type ListedItem = {
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

  /**
   * The avatar slots wearing it
   */
  readonly equippedAvatars: string

  /**
   * The den shop listing, or 0
   */
  readonly denStoreInvIdx: number
}

/**
 * Inventory changes
 */
export type ItemChange = {
  /**
   * Whether the added item is worn
   */
  readonly wear: boolean

  /**
   * The added colour
   */
  readonly color: number

  /**
   * What is added
   */
  readonly added: readonly { readonly invId: number; readonly defId: number }[]

  /**
   * The taken places
   */
  readonly removed: readonly number[]
}

/**
 * An avatar's items
 * @class
 */
@Packet(Outgoing.ItemList, 'xt')
export class ItemListOutgoing extends OutgoingPacket {
  /**
   * 0 inventory, 1 worn, 2 change
   */
  @Field.int() public readonly kind: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists the player's whole inventory
   * @param room The target room
   * @param owner The player
   * @param avatar The avatar
   * @param items The items
   * @returns The packet
   */
  public static inventory(
    room: number,
    owner: ItemOwner,
    avatar: ItemAvatar,
    items: readonly ListedItem[],
  ): ItemListOutgoing {
    const body = items.flatMap((item) => [
      String(item.defId),
      String(item.invId),
      String(item.color >>> 0),
      item.equippedAvatars,
      String(item.denStoreInvIdx),
    ])

    return ItemListOutgoing.build(room, 0, owner, avatar, [
      String(items.length),
      ...body,
    ])
  }

  /**
   * Lists what an avatar wears
   * @param room The target room
   * @param owner The player
   * @param avatar The avatar
   * @param items The items worn
   * @returns The packet
   */
  public static worn(
    room: number,
    owner: ItemOwner,
    avatar: ItemAvatar,
    items: readonly ListedItem[],
  ): ItemListOutgoing {
    const body = items.flatMap((item) => [
      String(item.defId),
      String(item.invId),
      String(item.color >>> 0),
    ])

    return ItemListOutgoing.build(room, 1, owner, avatar, [
      String(items.length),
      ...body,
    ])
  }

  /**
   * Lists inventory changes
   * @param owner The player
   * @param avatar The wearing avatar
   * @param change What changed
   * @returns The packet
   */
  public static changed(
    owner: ItemOwner,
    avatar: ItemAvatar,
    change: ItemChange,
  ): ItemListOutgoing {
    const body = [
      change.wear ? '1' : '0',
      String(avatar.perUserId),
      owner.username,
      String(change.color >>> 0),
      String(change.added.length),
      String(change.removed.length),
      ...change.added.flatMap(({ invId, defId }) => [
        String(invId),
        String(defId),
      ]),
      ...change.removed.map(String),
    ]

    return PacketFactory.create<ItemListOutgoing>(ItemListOutgoing, {
      room: -1,
      kind: 2,
      body,
    })
  }

  /**
   * Builds the packet
   * @param room The target room
   * @param kind 0 inventory, 1 worn
   * @param owner The player
   * @param avatar The avatar
   * @param items The items
   * @returns The packet
   */
  private static build(
    room: number,
    kind: number,
    owner: ItemOwner,
    avatar: ItemAvatar,
    items: readonly string[],
  ): ItemListOutgoing {
    const body = [
      '1',
      String(avatar.perUserId),
      owner.username,
      String(avatar.patternDefId),
      String(avatar.eyesDefId),
      ...items,
    ]

    return PacketFactory.create<ItemListOutgoing>(ItemListOutgoing, {
      room,
      kind,
      body,
    })
  }
}
