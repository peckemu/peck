import XmlBuilder from 'fast-xml-builder'
import { XMLParser } from 'fast-xml-parser'
import { SyntaxValidator } from 'fast-xml-validator'

import { ProtocolError } from '#protocol/error'
import { Message } from '#protocol/wire/message'
import {
  XML_ATTRIBUTE_PREFIX,
  XML_CDATA,
  XML_TEXT_NODE,
  XmlNode,
} from '#protocol/wire/xml/node'

/**
 * Matches the body tag
 */
const BODY_OPEN = /<body(?=[\s/>])[^>]*>/

/**
 * Forbidden markup
 */
const FORBIDDEN = /<!(?!\[CDATA\[)|<\?/

/**
 * The deepest SmartFox nesting
 */
const MAX_DEPTH = 10

/**
 * A SmartFox system message
 * @class
 */
export class XmlMessage extends Message {
  /**
   * The parser for client frames
   */
  private static readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: XML_ATTRIBUTE_PREFIX,
    textNodeName: XML_TEXT_NODE,
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: false,
    maxNestedTags: MAX_DEPTH,
    processEntities: {
      enabled: true,
      maxEntityCount: 0,
      maxExpandedLength: 4096,
    },
  })

  /**
   * The builder for server frames
   */
  private static readonly builder = new XmlBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: XML_ATTRIBUTE_PREFIX,
    textNodeName: XML_TEXT_NODE,
    cdataPropName: XML_CDATA,
    suppressEmptyNode: false,
  })

  /**
   * The packet format of the message
   */
  public readonly format = 'xml'

  /**
   * The body element
   */
  public readonly body: XmlNode

  /**
   * The login signature
   */
  public readonly signature: string | null

  /**
   * The raw body
   */
  public readonly signedBody: string

  /**
   * Creates a new XML message
   * @param header What the message is
   * @param room The message's room
   * @param body The body element
   * @param signature The client's signature
   * @param signedBody The raw body
   */
  public constructor(
    header: string,
    room: number,
    body: XmlNode,
    signature: string | null,
    signedBody: string,
  ) {
    super(header, room)
    this.body = body
    this.signature = signature
    this.signedBody = signedBody
  }

  /**
   * Parses a client frame
   * @param frame The frame to parse
   * @returns The parsed message
   */
  public static parse(frame: string): XmlMessage {
    if (FORBIDDEN.test(frame)) {
      throw new ProtocolError('XML has forbidden markup', 'XML_SYNTAX')
    }
    let document: Record<string, unknown>
    try {
      SyntaxValidator.validate(frame)
      document = XmlMessage.parser.parse(frame) as Record<string, unknown>
    } catch (error) {
      throw new ProtocolError('Invalid XML', 'XML_SYNTAX', error)
    }
    const root = new XmlNode('msg', document['msg'])
    const body = Object.hasOwn(document, 'msg') ? root.child('body') : null
    const header = body?.attribute('action') ?? null
    if (!body || header === null) {
      throw new ProtocolError('Not a SmartFox message', 'XML_SYNTAX')
    }
    return new XmlMessage(
      header,
      Message.room(body.attribute('r') ?? '-1', 'XML_SYNTAX'),
      body,
      root.attribute('h'),
      XmlMessage.inside(frame),
    )
  }

  /**
   * Builds a server frame
   * @param header What the message is
   * @param room The room to send the message in
   * @param body The body in the builder's shape
   * @param handler The envelope's handler
   * @returns The frame as a string
   */
  public static build(
    header: string,
    room: number,
    body: Readonly<Record<string, unknown>>,
    handler = 'sys',
  ): string {
    return XmlMessage.builder.build({
      msg: {
        '@t': handler,
        body: { ...body, '@action': header, '@r': String(room) },
      },
    })
  }

  /**
   * Cuts a frame's raw body
   * @param frame The frame
   * @returns The inside of the body
   */
  private static inside(frame: string): string {
    const open = BODY_OPEN.exec(frame)
    if (!open || open[0].endsWith('/>')) return ''
    const start = open.index + open[0].length
    const end = frame.lastIndexOf('</body>')
    return end < start ? '' : frame.slice(start, end)
  }
}
