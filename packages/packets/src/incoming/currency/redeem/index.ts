import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Redeems a code
 * @class
 */
@Packet(Incoming.RedeemCode, 'xt')
export class RedeemCodeIncoming extends IncomingPacket {
  /**
   * The code
   */
  @Field.string() public readonly code: string = ''

  /**
   * The captcha shown
   */
  @Field.string() public readonly captchaQuestion: string = ''

  /**
   * The captcha answer
   */
  @Field.string() public readonly captchaAnswer: string = ''
}
