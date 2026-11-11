/**
 * How a chat message was made
 */
export const ChatKind = {
  /**
   * Free chat
   */
  Free: 0,
  /**
   * A predefined phrase
   */
  SafeChat: 1,
  /**
   * An emote
   */
  Emote: 2,
  /**
   * An action
   */
  Action: 3,
  /**
   * An emote attached to the avatar
   */
  AttachmentEmote: 4,
  /**
   * A lasting emote
   */
  PermanentEmote: 5,
  /**
   * Riding a slide
   */
  Slide: 6,
  /**
   * A pet's action
   */
  PetAction: 7,
  /**
   * The avatar's blend colour
   */
  BlendColor: 8,
  /**
   * Safe chat account free chat
   */
  FreeSafeChat: 9,
  /**
   * The avatar's transparency
   */
  Alpha: 10,
  /**
   * Hosting a custom adventure
   */
  CustomAdventure: 11,
  /**
   * Hosting a player versus player game
   */
  CustomPvp: 12,
} as const

/**
 * One of the chat kind values
 */
export type ChatKind = (typeof ChatKind)[keyof typeof ChatKind]

/**
 * Every chat kind value
 */
const CHAT_KINDS: ReadonlySet<number> = new Set(Object.values(ChatKind))

/**
 * Checks for a chat kind
 * @param value The number to check
 * @returns Whether the number is a chat kind
 */
export const isChatKind = (value: number): value is ChatKind =>
  CHAT_KINDS.has(value)
