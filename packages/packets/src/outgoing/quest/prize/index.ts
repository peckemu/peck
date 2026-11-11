import { QuestPrizeKind } from '@peck/shared'

import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A prize shown
 */
export type ShownPrize = {
  /**
   * What it is
   */
  readonly kind: QuestPrizeKind

  /**
   * The item or the amount
   */
  readonly value: number

  /**
   * The clothing colour
   */
  readonly color: number
}

/**
 * The look of the member chest popup
 */
const MEMBER_POPUP = 2

/**
 * A treasure's prize
 * @class
 */
@Packet(Outgoing.QuestTreasure, 'xt')
export class QuestTreasureOutgoing extends OutgoingPacket {
  /**
   * The treasure
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * What the prize is
   */
  @Field.int() public readonly prize: number = 0

  /**
   * The item or the amount
   */
  @Field.int() public readonly value: number = 0

  /**
   * The clothing colour
   */
  @Field.uint() public readonly color: number = 0

  /**
   * The popup's look
   */
  @Field.int() public readonly popup: number = 0

  /**
   * Offers a treasure's prize
   * @param room The target room
   * @param actorId The treasure
   * @param prize The prize
   * @param members Whether it is a member chest
   * @returns The packet
   */
  public static of(
    room: number,
    actorId: string,
    prize: ShownPrize,
    members: boolean,
  ): QuestTreasureOutgoing {
    return PacketFactory.create<QuestTreasureOutgoing>(QuestTreasureOutgoing, {
      room,
      actorId,
      prize: prize.kind,
      value: prize.value,
      color: prize.color >>> 0,
      popup: members ? MEMBER_POPUP : 0,
    })
  }

  /**
   * Opens an empty treasure
   * @param room The target room
   * @param actorId The treasure
   * @returns The packet
   */
  public static opened(room: number, actorId: string): QuestTreasureOutgoing {
    return PacketFactory.create<QuestTreasureOutgoing>(QuestTreasureOutgoing, {
      room,
      actorId,
      prize: QuestPrizeKind.Open,
      value: 0,
      color: 0,
      popup: 0,
    })
  }

  /**
   * Closes a treasure
   * @param room The target room
   * @param actorId The treasure
   * @returns The packet
   */
  public static reset(room: number, actorId: string): QuestTreasureOutgoing {
    return PacketFactory.create<QuestTreasureOutgoing>(QuestTreasureOutgoing, {
      room,
      actorId,
      prize: QuestPrizeKind.Reset,
      value: 0,
      color: 0,
      popup: 0,
    })
  }
}

/**
 * Lists a reward screen
 * @param popupType The screen's look
 * @param gifts The gifts
 * @returns The fields
 */
const giftsBody = (
  popupType: number,
  gifts: readonly ShownPrize[],
): readonly string[] => [
  String(gifts.length),
  String(popupType),
  ...gifts.flatMap(({ kind, value, color }) =>
    [kind, value, color >>> 0].map(String),
  ),
]

/**
 * An adventure's gifts
 * @class
 */
@Packet(Outgoing.QuestGifts, 'xt')
export class QuestGiftsOutgoing extends OutgoingPacket {
  /**
   * The screen and its gifts
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Opens the reward screen
   * @param room The target room
   * @param popupType The screen's look
   * @param gifts The gifts
   * @returns The packet
   */
  public static of(
    room: number,
    popupType: number,
    gifts: readonly ShownPrize[],
  ): QuestGiftsOutgoing {
    return PacketFactory.create<QuestGiftsOutgoing>(QuestGiftsOutgoing, {
      room,
      body: giftsBody(popupType, gifts),
    })
  }
}

/**
 * A player's own gifts
 * @class
 */
@Packet(Outgoing.QuestPlayerGifts, 'xt')
export class QuestPlayerGiftsOutgoing extends OutgoingPacket {
  /**
   * The screen and its gifts
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Opens the player's own reward screen
   * @param room The target room
   * @param popupType The screen's look
   * @param gifts The gifts
   * @returns The packet
   */
  public static of(
    room: number,
    popupType: number,
    gifts: readonly ShownPrize[],
  ): QuestPlayerGiftsOutgoing {
    return PacketFactory.create<QuestPlayerGiftsOutgoing>(
      QuestPlayerGiftsOutgoing,
      {
        room,
        body: giftsBody(popupType, gifts),
      },
    )
  }
}
