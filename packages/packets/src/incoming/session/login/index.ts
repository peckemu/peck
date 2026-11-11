import { createHmac, timingSafeEqual } from 'node:crypto'

import {
  Field,
  type FieldDefinition,
  IncomingPacket,
  Packet,
} from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Reads a nick value
 * @param index Where the value sits in the nick
 * @returns The field definition
 */
const nick = (index: number): FieldDefinition<string> =>
  Field.map(Field.string({ path: 'login/nick' }), {
    read: (text) => text.split('%')[index] ?? '',
  })

/**
 * Logs in to a zone
 * @class
 */
@Packet(Incoming.Login, 'xml')
export class LoginIncoming extends IncomingPacket {
  /**
   * The zone being logged in to
   */
  @Field.string({ path: 'login/@z' }) public readonly zone: string = ''

  /**
   * The username
   */
  @nick(0) public readonly username: string = ''

  /**
   * The web session id
   */
  @nick(1) public readonly sessionId: string = ''

  /**
   * The account language
   */
  @nick(2) public readonly language: string = ''

  /**
   * The client build
   */
  @nick(3) public readonly deployVersion: string = ''

  /**
   * The platform the client runs on
   */
  @nick(4) public readonly platform: string = ''

  /**
   * The platform version
   */
  @nick(5) public readonly platformVersion: string = ''

  /**
   * The operating system
   */
  @nick(6) public readonly os: string = ''

  /**
   * The device fingerprint
   */
  @nick(7) public readonly fingerprint: string = ''

  /**
   * The web login token
   */
  @Field.string({ path: 'login/pword', redacted: true })
  public readonly token: string = ''

  /**
   * The login's signature, or null
   */
  @Field.message('signature') public readonly signature: string | null = null

  /**
   * The signed body
   */
  @Field.message('signedBody', { redacted: true })
  public readonly signedBody: string = ''

  /**
   * Checks the login signature
   * @param key The connection's key
   * @returns Whether the signature is valid
   */
  public signedWith(key: string | null): boolean {
    if (key === null || this.signature === null || this.signature === '') {
      return false
    }
    const digest = createHmac('sha256', key).update(this.signedBody).digest()
    return [
      Buffer.from(this.signature, 'base64'),
      Buffer.from(this.signature, 'hex'),
    ].some(
      (given) =>
        given.length === digest.length && timingSafeEqual(given, digest),
    )
  }
}
