import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for the Jam-a-Grams
 * @class
 */
@Packet(Incoming.JamagramList, 'xt')
export class JamagramListIncoming extends IncomingPacket {
  /**
   * The rest
   */
  @Field.rest() public readonly rest: readonly string[] = []
}

/**
 * Sends a Jam-a-Gram
 * @class
 */
@Packet(Incoming.JamagramSend, 'xt')
export class JamagramSendIncoming extends IncomingPacket {
  /**
   * Who it is for
   */
  @Field.string() public readonly userName: string = ''

  /**
   * The card's picture
   */
  @Field.int() public readonly cardMediaId: number = 0

  /**
   * The stamp's picture
   */
  @Field.int() public readonly stampMediaId: number = 0

  /**
   * 1 safe chat, 2 typed
   */
  @Field.int() public readonly messageType: number = 0

  /**
   * What it says
   */
  @Field.string() public readonly message: string = ''

  /**
   * What it carries
   */
  @Field.int() public readonly type: number = 0

  /**
   * The gift's inventory index, or -1
   */
  @Field.int() public readonly giftInvIdx: number = -1

  /**
   * 0 normal, 1 valentine
   */
  @Field.int() public readonly specialType: number = 0
}

/**
 * Opens a Jam-a-Gram
 * @class
 */
@Packet(Incoming.JamagramRead, 'xt')
export class JamagramReadIncoming extends IncomingPacket {
  /**
   * The card
   */
  @Field.int() public readonly messageId: number = 0
}

/**
 * Deletes a Jam-a-Gram
 * @class
 */
@Packet(Incoming.JamagramDelete, 'xt')
export class JamagramDeleteIncoming extends IncomingPacket {
  /**
   * The card
   */
  @Field.int() public readonly messageId: number = 0
}

/**
 * Accepts or returns a gift
 * @class
 */
@Packet(Incoming.JamagramGift, 'xt')
export class JamagramGiftIncoming extends IncomingPacket {
  /**
   * The card
   */
  @Field.int() public readonly messageId: number = 0

  /**
   * 1 to keep it
   */
  @Field.int() public readonly accept: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly rest: readonly string[] = []
}

/**
 * Answers a buddy request card
 * @class
 */
@Packet(Incoming.JamagramBuddy, 'xt')
export class JamagramBuddyIncoming extends IncomingPacket {
  /**
   * The rest
   */
  @Field.rest() public readonly rest: readonly string[] = []
}

/**
 * Clears the inbox cache
 * @class
 */
@Packet(Incoming.JamagramClear, 'xt')
export class JamagramClearIncoming extends IncomingPacket {}

/**
 * Changes Jam-a-Gram privacy
 * @class
 */
@Packet(Incoming.JamagramPrivacy, 'xt')
export class JamagramPrivacyIncoming extends IncomingPacket {
  /**
   * 0 nobody, 1 buddies, 2 everyone
   */
  @Field.int() public readonly setting: number = 0
}
