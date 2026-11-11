import {
  CURRENCIES,
  type Currency,
  JamaaCalendar,
  LoginStatus,
} from '@peck/shared'

import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The login player details
 */
export type LoginParams = Record<string, unknown> & {
  /**
   * The player's SmartFox user id
   */
  userId?: number

  /**
   * The player's username
   */
  userName?: string

  /**
   * The player's id in the database
   */
  dbUserId?: number

  /**
   * The player's UUID
   */
  uuid?: string

  /**
   * The name of the player's avatar
   */
  avName?: string

  /**
   * The id of the player's current avatar
   */
  perUserAvId?: number

  /**
   * The account type
   */
  accountType?: number

  /**
   * Whether the player is a guide
   */
  isGuide?: boolean

  /**
   * Whether the player is a moderator
   */
  isModerator?: boolean

  /**
   * What the player may do
   */
  interactions?: number

  /**
   * The player's safe chat type
   */
  sgChatType?: number

  /**
   * The account's pending flags
   */
  pendingFlags?: number

  /**
   * The login count
   */
  numLogins?: number

  /**
   * When the account was created
   */
  createdAt?: number

  /**
   * The account's email address
   */
  email?: string

  /**
   * The membership days left
   */
  numDaysLeftOnSubscription?: number

  /**
   * The unread Jam-a-Grams
   */
  numUnreadECards?: number

  /**
   * Who may visit the player's den
   */
  denPrivacySettings?: number

  /**
   * Who may send the player jam-a-grams
   */
  eCardPrivacySettings?: number

  /**
   * The active den's inventory id
   */
  activeDenRoomInvId?: number

  /**
   * The active pet's inventory id
   */
  activePetInvId?: number

  /**
   * The last broadcast
   */
  lastBroadcastMessage?: string

  /**
   * The unrestricted safe chat type
   */
  sgChatTypeNonDegraded?: number

  /**
   * Whether it is the player's own name
   */
  userNameModerated?: number

  /**
   * Whether any buddy is playing
   */
  hasOnlineBuddies?: boolean

  /**
   * The mute time left
   */
  isSilenced?: number

  /**
   * An email address waiting to be confirmed
   */
  pendingEmail?: string

  /**
   * The recycling refund share
   */
  recyclePercentage?: number

  /**
   * How many redemption cards the player has
   */
  numRedemptionCards?: number

  /**
   * How many gift cards the player has
   */
  numAJHQGiftCards?: number

  /**
   * The player's bulk gift cards
   */
  numAJHQBulkGiftCards?: number

  /**
   * Who may post on the player's wall
   */
  playerWallSettings?: number

  /**
   * Whether the player's wall is open
   */
  webWallStatus?: number

  /**
   * Today in Jamaa
   */
  jamaaDate?: number

  /**
   * The daily gift day, or -1
   */
  dailyGiftIndex?: number

  /**
   * The player's session
   */
  sessionId?: number

  /**
   * The player's adopt a pet cards
   */
  usableAdoptAPetDefs?: readonly unknown[]

  /**
   * The newspapers seen
   */
  newspaperDefs?: readonly { readonly defId: number; readonly ts: number }[]
}

/**
 * The player a login sends
 */
export type LoginPlayer = Readonly<Record<Currency, number>> & {
  readonly gameId: number
  readonly username: string
  readonly uuid: string
  readonly accountType: number
  readonly pendingFlags: number
  readonly interactions: number
  readonly chatType: number
  readonly chatTypeNonDegraded: number
  readonly numLogins: number
  readonly createdAt: Date
  readonly denPrivacy: number
  readonly ecardPrivacy: number
  readonly wallSettings: number
  readonly wallStatus: number
  readonly activeDenInvIdx: number
  readonly newspapersSeen?: readonly {
    readonly defId: number
    readonly seenTs: number
  }[]
  readonly hasOnlineBuddies?: boolean
  readonly unreadCards?: number
  readonly moderator?: boolean
  readonly silenced?: number
  readonly avatars?: readonly {
    readonly avName: string
    readonly perUserAvId: number
    readonly active: boolean
  }[]
}

/**
 * The minimum account age in seconds
 */
const AT_LEAST = 2 * 24 * 60 * 60

/**
 * The new player defaults
 */
const NEW_PLAYER = {
  avName: ' ',
  perUserAvId: 1,
  activePetInvId: 0,
  userNameModerated: 1,
  isGuide: false,
  isModerator: false,
  hasOnlineBuddies: false,
  email: '',
  pendingEmail: '',
  numDaysLeftOnSubscription: 365,
  recyclePercentage: Math.fround(0.3),
  numUnreadECards: 0,
  numRedemptionCards: 0,
  numAJHQGiftCards: 0,
  numAJHQBulkGiftCards: 0,
  dailyGiftIndex: -1,
  lastBroadcastMessage: '',
  usableAdoptAPetDefs: [],
} as const satisfies LoginParams

/**
 * The login result
 * @class
 */
@Packet(Outgoing.LoginResult, 'json')
export class LoginResultOutgoing extends OutgoingPacket {
  /**
   * Whether the login worked
   */
  @Field.enum({ failure: 0, success: 1 }) public readonly status: 0 | 1 = 0

  /**
   * Why the login failed
   */
  @Field.optional(Field.enum(LoginStatus))
  public readonly statusId?: LoginStatus

  /**
   * Shown to the player on a failure
   */
  @Field.optional(Field.string()) public readonly message?: string

  /**
   * The player on a success
   */
  @Field.record<LoginParams>() public readonly params: LoginParams = {}

  /**
   * Creates a login success
   * @param userId The player's session id
   * @param player The new player
   * @param now The time in milliseconds
   * @returns The login reply
   */
  public static success(
    userId: number,
    player: LoginPlayer,
    now = Date.now(),
  ): LoginResultOutgoing {
    const avatar = player.avatars?.find(({ active }) => active)

    const params: LoginParams = {
      ...NEW_PLAYER,
      ...(avatar
        ? { avName: avatar.avName, perUserAvId: avatar.perUserAvId }
        : {}),
      ...LoginResultOutgoing.currencies(player),
      userId,
      sessionId: userId,
      userName: player.username,
      dbUserId: player.gameId,
      uuid: player.uuid,
      accountType: player.accountType,
      pendingFlags: player.pendingFlags,
      interactions: player.interactions,
      sgChatType: player.chatType,
      sgChatTypeNonDegraded: player.chatTypeNonDegraded,
      numLogins: player.numLogins,
      createdAt: Math.floor(
        Math.min(player.createdAt.getTime(), now - AT_LEAST * 1000) / 1000,
      ),
      denPrivacySettings: player.denPrivacy,
      eCardPrivacySettings: player.ecardPrivacy,
      playerWallSettings: player.wallSettings,
      webWallStatus: player.wallStatus,
      activeDenRoomInvId: player.activeDenInvIdx,
      hasOnlineBuddies: player.hasOnlineBuddies ?? false,
      numUnreadECards: player.unreadCards ?? 0,
      isModerator: player.moderator ?? false,
      ...(player.silenced === undefined ? {} : { isSilenced: player.silenced }),
      jamaaDate: JamaaCalendar.dayOf(now),
      newspaperDefs: (player.newspapersSeen ?? []).map(({ defId, seenTs }) => ({
        defId,
        ts: seenTs,
      })),
    }

    return PacketFactory.create<LoginResultOutgoing>(LoginResultOutgoing, {
      status: 1,
      params,
    })
  }

  /**
   * Creates a login failure
   * @param message The message to show the player
   * @param statusId Why the login failed
   * @returns The login reply
   */
  public static failure(
    message: string,
    statusId: LoginStatus = LoginStatus.Failed,
  ): LoginResultOutgoing {
    return PacketFactory.create<LoginResultOutgoing>(LoginResultOutgoing, {
      status: 0,
      statusId,
      message,
      params: {},
    })
  }

  /**
   * Counts the player's currencies
   * @param player The player
   * @returns The counts by currency
   */
  private static currencies(
    player: LoginPlayer,
  ): Record<`${Currency}Count`, number> {
    const counts = {} as Record<`${Currency}Count`, number>
    for (const name of CURRENCIES) counts[`${name}Count`] = player[name]
    return counts
  }
}
