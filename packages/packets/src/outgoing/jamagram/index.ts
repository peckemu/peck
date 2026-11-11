import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A Jam-a-Gram view
 */
export type ShownJamagram = {
  /**
   * Its id
   */
  readonly id: number

  /**
   * Who sent it
   */
  readonly senderName: string

  /**
   * The card's picture
   */
  readonly cardMediaId: number

  /**
   * The stamp's picture
   */
  readonly stampMediaId: number

  /**
   * Whether it was opened
   */
  readonly read: boolean

  /**
   * What it says
   */
  readonly message: string

  /**
   * What it carries
   */
  readonly type: number

  /**
   * The gift's id
   */
  readonly giftId: number

  /**
   * The gift's colour
   */
  readonly giftColor: number

  /**
   * The gift's name
   */
  readonly giftName: string

  /**
   * The sender's account type
   */
  readonly senderAccountType: number

  /**
   * 0 a player, 1 AJHQ
   */
  readonly senderType: number

  /**
   * 0 normal, 1 valentine
   */
  readonly specialType: number
}

/**
 * Writes a card's fields
 * @param card The card
 * @returns The fields
 */
const cardFields = (card: ShownJamagram): string[] => [
  String(card.id),
  card.senderName,
  String(card.cardMediaId),
  String(card.stampMediaId),
  card.read ? '1' : '0',
  card.message,
  String(card.type),
  String(card.giftId),
  String(card.giftColor >>> 0),
  card.giftName,
  String(card.senderAccountType),
  '0',
  '0',
  String(card.senderType),
  '1',
  '',
  String(card.specialType),
]

/**
 * The Jam-a-Grams
 * @class
 */
@Packet(Outgoing.JamagramList, 'xt')
export class JamagramListOutgoing extends OutgoingPacket {
  /**
   * How many, or -1
   */
  @Field.int() public readonly count: number = -1

  /**
   * The cards
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists the cards
   * @param room The room
   * @param cards The cards
   * @returns The packet
   */
  public static of(
    room: number,
    cards: readonly ShownJamagram[],
  ): JamagramListOutgoing {
    return PacketFactory.create<JamagramListOutgoing>(JamagramListOutgoing, {
      room,
      count: cards.length === 0 ? -1 : cards.length,
      body: cards.flatMap((card) => cardFields(card)),
    })
  }
}

/**
 * A Jam-a-Gram arrived
 * @class
 */
@Packet(Outgoing.JamagramPush, 'xt')
export class JamagramPushOutgoing extends OutgoingPacket {
  /**
   * The card
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Sends a card
   * @param card The card
   * @returns The packet
   */
  public static of(card: ShownJamagram): JamagramPushOutgoing {
    return PacketFactory.create<JamagramPushOutgoing>(JamagramPushOutgoing, {
      room: -1,
      body: cardFields(card),
    })
  }
}

/**
 * Why a Jam-a-Gram wasn't sent
 */
export const JamagramRefusal = {
  /**
   * It can't go to them
   */
  Refused: 0,

  /**
   * Their inbox is full
   */
  Full: -1,

  /**
   * They aren't taking any
   */
  NotAccepting: -2,
} as const

/**
 * Why a Jam-a-Gram wasn't sent
 */
export type JamagramRefusal =
  (typeof JamagramRefusal)[keyof typeof JamagramRefusal]

/**
 * Whether a Jam-a-Gram was sent
 * @class
 */
@Packet(Outgoing.JamagramSend, 'xt')
export class JamagramSendOutgoing extends OutgoingPacket {
  /**
   * The result
   */
  @Field.int() public readonly result: number = 0

  /**
   * Says it was sent
   * @param room The room
   * @returns The packet
   */
  public static sent(room: number): JamagramSendOutgoing {
    return PacketFactory.create<JamagramSendOutgoing>(JamagramSendOutgoing, {
      room,
      result: 1,
    })
  }

  /**
   * Says it wasn't sent
   * @param room The room
   * @param refusal Why
   * @returns The packet
   */
  public static refused(
    room: number,
    refusal: JamagramRefusal = JamagramRefusal.Refused,
  ): JamagramSendOutgoing {
    return PacketFactory.create<JamagramSendOutgoing>(JamagramSendOutgoing, {
      room,
      result: refusal,
    })
  }
}

/**
 * Whether a Jam-a-Gram was opened
 * @class
 */
@Packet(Outgoing.JamagramRead, 'xt')
export class JamagramReadOutgoing extends OutgoingPacket {
  /**
   * The card
   */
  @Field.int() public readonly messageId: number = 0

  /**
   * Whether it worked
   */
  @Field.int() public readonly result: number = 0
}

/**
 * The Jam-a-Grams deleted
 * @class
 */
@Packet(Outgoing.JamagramDelete, 'xt')
export class JamagramDeleteOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly result: number = 0

  /**
   * How many
   */
  @Field.int() public readonly count: number = 0

  /**
   * The cards
   */
  @Field.rest() public readonly ids: readonly string[] = []

  /**
   * Lists the cards deleted
   * @param room The room
   * @param ids The cards
   * @returns The packet
   */
  public static of(
    room: number,
    ids: readonly number[],
  ): JamagramDeleteOutgoing {
    return PacketFactory.create<JamagramDeleteOutgoing>(
      JamagramDeleteOutgoing,
      {
        room,
        result: ids.length > 0 ? 1 : 0,
        count: ids.length,
        ids: ids.map(String),
      },
    )
  }
}

/**
 * Whether a gift was kept
 * @class
 */
@Packet(Outgoing.JamagramGift, 'xt')
export class JamagramGiftOutgoing extends OutgoingPacket {
  /**
   * The card
   */
  @Field.int() public readonly messageId: number = 0

  /**
   * Whether it worked
   */
  @Field.int() public readonly result: number = 0
}

/**
 * The answer to a buddy request card
 * @class
 */
@Packet(Outgoing.JamagramBuddy, 'xt')
export class JamagramBuddyOutgoing extends OutgoingPacket {
  /**
   * The result
   */
  @Field.int() public readonly result: number = -1
}

/**
 * Whether the privacy changed
 * @class
 */
@Packet(Outgoing.JamagramPrivacy, 'xt')
export class JamagramPrivacyOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly result: number = 0
}
