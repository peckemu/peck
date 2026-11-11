import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A list's details
 */
export type GenericListHead = {
  /**
   * The list id
   */
  readonly listId: number

  /**
   * Its body type
   */
  readonly listType: number

  /**
   * What the whole list costs in diamonds
   */
  readonly diamondCost: number

  /**
   * Whether the list is bought whole
   */
  readonly diamondBundle: boolean
}

/**
 * A group of a combined list
 */
export type GenericListGroup = {
  /**
   * Its item type
   */
  readonly listType: number

  /**
   * Its ids
   */
  readonly ids: readonly number[]
}

/**
 * A generic list
 * @class
 */
@Packet(Outgoing.GenericList, 'xt')
export class GenericListOutgoing extends OutgoingPacket {
  /**
   * The list id
   */
  @Field.int() public readonly listId: number = 0

  /**
   * Its body type
   */
  @Field.int() public readonly listType: number = 0

  /**
   * The title string id, or empty
   */
  @Field.string() public readonly titleStrId: string = ''

  /**
   * A field the client never reads
   */
  @Field.string() public readonly unused: string = ''

  /**
   * Whether the list is bought whole
   */
  @Field.string() public readonly diamondBundle: string = 'false'

  /**
   * What the whole list costs in diamonds
   */
  @Field.int() public readonly diamondCost: number = 0

  /**
   * The typed body
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists media
   * @param head The list's head
   * @param media The media
   * @param room The target room
   * @returns The packet
   */
  public static media(
    head: GenericListHead,
    media: readonly { readonly media: number; readonly name: number }[],
    room: number,
  ): GenericListOutgoing {
    const body = [
      String(media.length),
      ...media.flatMap(({ media: id, name }) => [String(id), String(name)]),
    ]

    return GenericListOutgoing.build(head, body, room)
  }

  /**
   * Builds a list of ids
   * @param head The list's details
   * @param ids The ids
   * @param room The target room
   * @returns The packet
   */
  public static ids(
    head: GenericListHead,
    ids: readonly number[],
    room: number,
  ): GenericListOutgoing {
    return GenericListOutgoing.build(
      head,
      [String(ids.length), ...ids.map(String)],
      room,
    )
  }

  /**
   * Builds a combined list
   * @param head The list's details
   * @param groups The groups
   * @param room The target room
   * @returns The packet
   */
  public static combined(
    head: GenericListHead,
    groups: readonly GenericListGroup[],
    room: number,
  ): GenericListOutgoing {
    const body = [
      String(groups.length),
      groups.map(({ listType }) => listType).join(','),
      groups.map(({ ids }) => ids.length).join(','),
      ...groups.flatMap(({ ids }) => ids.map(String)),
    ]

    return GenericListOutgoing.build(head, body, room)
  }

  /**
   * Builds the packet
   * @param head The list's details
   * @param body The body
   * @param room The target room
   * @returns The packet
   */
  private static build(
    head: GenericListHead,
    body: readonly string[],
    room: number,
  ): GenericListOutgoing {
    return PacketFactory.create<GenericListOutgoing>(GenericListOutgoing, {
      room,
      listId: head.listId,
      listType: head.listType,
      titleStrId: '',
      unused: '',
      diamondBundle: head.diamondBundle ? 'true' : 'false',
      diamondCost: head.diamondCost,
      body,
    })
  }
}
