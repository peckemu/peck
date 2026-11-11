import { AccountType } from '@peck/shared'
import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
  OneToMany,
  OneToOne,
  sql,
  uuid,
} from 'uql-orm'

import { Account } from '#database/entities/accounts/account'
import { Achievement } from '#database/entities/achievement'
import { Avatar } from '#database/entities/avatar'
import { WorldItemClaim } from '#database/entities/claim'
import { DenItem } from '#database/entities/den/item'
import { DenRoom } from '#database/entities/den/room'
import { Item } from '#database/entities/item'
import { Like } from '#database/entities/like'
import { NewspaperSeen } from '#database/entities/newspaper'
import { Pet } from '#database/entities/pet'
import { ItemPrize } from '#database/entities/prize'
import { CommandSettings } from '#database/entities/settings'
import { TradeListing } from '#database/entities/trade/listing'
import { Transaction } from '#database/entities/transactions/transaction'
import { UserVariable } from '#database/entities/variable'

/**
 * The fields the database fills
 */
type Filled =
  | 'uuid'
  | 'gems'
  | 'createdAt'
  | 'numLogins'
  | 'tickets'
  | 'orbs'
  | 'diamonds'
  | 'straw'
  | 'bamboo'
  | 'wood'
  | 'stone'
  | 'silver'
  | 'gold'
  | 'gemstone'
  | 'ecoCredits'
  | 'accountType'
  | 'pendingFlags'
  | 'chatType'
  | 'chatTypeNonDegraded'
  | 'interactions'
  | 'nameBarData'
  | 'denPrivacy'
  | 'ecardPrivacy'
  | 'wallSettings'
  | 'wallStatus'
  | 'avatarSlotFlags'
  | 'activeDenInvIdx'
  | 'unlockedPets'
  | 'dailyGiftIndex'
  | 'nextItemInvId'
  | 'nextDenItemInvIdx'
  | 'nextPetInvIdx'
  | 'ecoUnredeemed'
  | 'profilePublic'
  | 'signInNotices'
  | 'slot'
  | 'nameBarStyle'
  | 'balloonStyle'

/**
 * The largest uint32
 */
const UINT32_MAX = 4_294_967_295

/**
 * The starting flags
 */
const PENDING_FLAGS = 1 | 2 | 16

/**
 * A player
 * @class
 */
@Entity<Player>({
  name: 'players',
  indexes: [
    {
      name: 'players_username',
      unique: true,
      columns: (player) => [sql`lower(${player.username})`],
    },
    {
      name: 'players_account_slot',
      unique: true,
      columns: (player) => [player.accountId, player.slot],
    },
  ],
  checks: [
    { name: 'players_gems_check', where: { gems: { $gte: 0 } } },
    { name: 'players_num_logins_check', where: { numLogins: { $gte: 0 } } },
    { name: 'players_tickets_check', where: { tickets: { $gte: 0 } } },
    { name: 'players_orbs_check', where: { orbs: { $gte: 0 } } },
    { name: 'players_diamonds_check', where: { diamonds: { $gte: 0 } } },
    { name: 'players_straw_check', where: { straw: { $gte: 0 } } },
    { name: 'players_bamboo_check', where: { bamboo: { $gte: 0 } } },
    { name: 'players_wood_check', where: { wood: { $gte: 0 } } },
    { name: 'players_stone_check', where: { stone: { $gte: 0 } } },
    { name: 'players_silver_check', where: { silver: { $gte: 0 } } },
    { name: 'players_gold_check', where: { gold: { $gte: 0 } } },
    { name: 'players_gemstone_check', where: { gemstone: { $gte: 0 } } },
    { name: 'players_eco_credits_check', where: { ecoCredits: { $gte: 0 } } },
    {
      name: 'players_wall_settings_check',
      where: { wallSettings: { $between: [0, 2] } },
    },
    {
      name: 'players_wall_status_check',
      where: { wallStatus: { $in: [0, 1] } },
    },
    {
      name: 'players_avatar_slot_flags_check',
      where: { avatarSlotFlags: { $between: [0, UINT32_MAX] } },
    },
    {
      name: 'players_unlocked_pets_check',
      where: { unlockedPets: { $regex: '^[0-9]+(,[0-9]+)*$' } },
    },
    {
      name: 'players_next_item_inv_id_check',
      where: { nextItemInvId: { $gt: 0 } },
    },
    {
      name: 'players_next_den_item_inv_idx_check',
      where: { nextDenItemInvIdx: { $gt: 0 } },
    },
    {
      name: 'players_next_pet_inv_idx_check',
      where: { nextPetInvIdx: { $gt: 0 } },
    },
    {
      name: 'players_eco_unredeemed_check',
      where: { ecoUnredeemed: { $between: [0, 240] } },
    },
    { name: 'players_slot_check', where: { slot: { $gte: 1 } } },
    {
      name: 'players_name_bar_style_check',
      where: (player) =>
        sql`char_length(${player.nameBarStyle}) <= 80 AND ${player.nameBarStyle} ~ '^[a-z0-9.-]*$'`,
    },
    {
      name: 'players_balloon_style_check',
      where: (player) =>
        sql`char_length(${player.balloonStyle}) <= 120 AND ${player.balloonStyle} ~ '^[a-z0-9._-]*$'`,
    },
  ],
})
export class Player {
  /**
   * The key field
   */
  declare public [idKey]?: 'gameId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: Filled

  /**
   * The player's client id
   */
  @Id({ type: Number, columnType: 'integer', autoIncrement: true })
  public gameId!: number

  /**
   * The account the player belongs to
   */
  @Field({ references: () => Account, nullable: false, onDelete: 'CASCADE' })
  public accountId!: string

  /**
   * The player's public id
   */
  @Field({ type: 'uuid', nullable: false, unique: true, defaultValue: uuid })
  public uuid!: string

  /**
   * The player's username
   */
  @Field({ type: 'text', nullable: false })
  public username!: string

  /**
   * The player's slot
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 1,
  })
  public slot!: number

  /**
   * When the player was made
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * When the player last logged in
   */
  @Field({ type: Date })
  public lastLoginAt?: Date | null

  /**
   * The login count
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public numLogins!: number

  /**
   * The kind of account
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: AccountType.Member,
  })
  public accountType!: AccountType

  /**
   * Gems held
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public gems!: number

  /**
   * Tickets held
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public tickets!: number

  /**
   * Orbs held
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public orbs!: number

  /**
   * Diamonds held
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public diamonds!: number

  /**
   * Straw held
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public straw!: number

  /**
   * Bamboo held
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public bamboo!: number

  /**
   * Wood held
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public wood!: number

  /**
   * Stone held
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public stone!: number

  /**
   * Silver held
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public silver!: number

  /**
   * Gold held
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public gold!: number

  /**
   * Gemstones held
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public gemstone!: number

  /**
   * Eco credits held
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public ecoCredits!: number

  /**
   * Eco credits earned but not yet redeemed
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public ecoUnredeemed!: number

  /**
   * When eco credits were last earned
   */
  @Field({ type: Date })
  public ecoAccruedAt?: Date | null

  /**
   * Pending flags
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: PENDING_FLAGS,
  })
  public pendingFlags!: number

  /**
   * The chat the player may use
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 1,
  })
  public chatType!: number

  /**
   * The player's chat type
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 1,
  })
  public chatTypeNonDegraded!: number

  /**
   * Interaction flags
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 1023,
  })
  public interactions!: number

  /**
   * The name bar's settings
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public nameBarData!: number

  /**
   * The name bar's style
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public nameBarStyle!: string

  /**
   * The chat balloon's style
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public balloonStyle!: string

  /**
   * Who may visit the player's den
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public denPrivacy!: number

  /**
   * Who may send the player jamagrams
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 1,
  })
  public ecardPrivacy!: number

  /**
   * Who may post on the player's wall
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 1,
  })
  public wallSettings!: number

  /**
   * Whether the player's wall is open
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 1,
  })
  public wallStatus!: number

  /**
   * The unlocked avatar slots
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: UINT32_MAX,
  })
  public avatarSlotFlags!: number

  /**
   * The player's den index
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public activeDenInvIdx!: number

  /**
   * The unlocked pets
   */
  @Field({ type: 'text', nullable: false, defaultValue: '0' })
  public unlockedPets!: string

  /**
   * The daily gift day
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public dailyGiftIndex!: number

  /**
   * The next item id
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 1,
  })
  public nextItemInvId!: number

  /**
   * The next den item index
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 1,
  })
  public nextDenItemInvIdx!: number

  /**
   * The next pet index
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 1,
  })
  public nextPetInvIdx!: number

  /**
   * The profile privacy
   */
  @Field({ type: Boolean, nullable: false, defaultValue: true })
  public profilePublic!: boolean

  /**
   * Whether buddy alerts are on
   */
  @Field({ type: Boolean, nullable: false, defaultValue: true })
  public signInNotices!: boolean

  /**
   * The account the player belongs to
   */
  @ManyToOne({
    entity: () => Account,
    references: (player) => player.accountId,
  })
  public account?: Account

  /**
   * The player's command settings
   */
  @OneToOne({
    entity: () => CommandSettings,
    mappedBy: (settings) => settings.player,
  })
  public settings?: CommandSettings

  /**
   * The newspapers the player has seen
   */
  @OneToMany({ entity: () => NewspaperSeen, mappedBy: (seen) => seen.player })
  public newspapersSeen?: NewspaperSeen[]

  /**
   * The things the player has liked
   */
  @OneToMany({ entity: () => Like, mappedBy: (like) => like.liker })
  public likes?: Like[]

  /**
   * The achievements the player has earned
   */
  @OneToMany({
    entity: () => Achievement,
    mappedBy: (achievement) => achievement.player,
  })
  public achievements?: Achievement[]

  /**
   * The player's user variables
   */
  @OneToMany({
    entity: () => UserVariable,
    mappedBy: (variable) => variable.player,
  })
  public variables?: UserVariable[]

  /**
   * The items the player owns
   */
  @OneToMany({ entity: () => Item, mappedBy: (item) => item.player })
  public items?: Item[]

  /**
   * The player's transactions
   */
  @OneToMany({
    entity: () => Transaction,
    mappedBy: (transaction) => transaction.player,
  })
  public transactions?: Transaction[]

  /**
   * The picked up world items
   */
  @OneToMany({
    entity: () => WorldItemClaim,
    mappedBy: (claim) => claim.player,
  })
  public claims?: WorldItemClaim[]

  /**
   * The prizes the player has been offered
   */
  @OneToMany({ entity: () => ItemPrize, mappedBy: (prize) => prize.player })
  public prizes?: ItemPrize[]

  /**
   * The player's animals
   */
  @OneToMany({ entity: () => Avatar, mappedBy: (avatar) => avatar.player })
  public avatars?: Avatar[]

  /**
   * The player's den rooms
   */
  @OneToMany({ entity: () => DenRoom, mappedBy: (room) => room.player })
  public denRooms?: DenRoom[]

  /**
   * The player's den items
   */
  @OneToMany({ entity: () => DenItem, mappedBy: (item) => item.player })
  public denItems?: DenItem[]

  /**
   * The player's pets
   */
  @OneToMany({ entity: () => Pet, mappedBy: (pet) => pet.player })
  public pets?: Pet[]

  /**
   * The player's trade list
   */
  @OneToMany({
    entity: () => TradeListing,
    mappedBy: (listing) => listing.player,
  })
  public tradeList?: TradeListing[]
}
