import { RoleAssignment } from './access/assignment/index.ts'
import { AuditEntry } from './access/audit/index.ts'
import { RoleGrant } from './access/grant/index.ts'
import { PermissionOverride } from './access/override/index.ts'
import { PermissionRow } from './access/permission/index.ts'
import { Role } from './access/role/index.ts'
import { Account } from './accounts/account/index.ts'
import { Confirmation } from './accounts/confirmation/index.ts'
import { PasswordReset } from './accounts/reset/index.ts'
import { Session } from './accounts/session/index.ts'
import { Achievement } from './achievement/index.ts'
import { AchievementDefinition } from './definitions/achievement/index.ts'
import { Avatar } from './avatar/index.ts'
import { Block } from './buddies/block/index.ts'
import { Buddy } from './buddies/buddy/index.ts'
import { BuddyRequest } from './buddies/request/index.ts'
import { WorldItemClaim } from './claim/index.ts'
import { DenItem } from './den/item/index.ts'
import { DenLayout } from './den/layout/index.ts'
import { DenShopListing } from './den/listing/index.ts'
import { DenRoom } from './den/room/index.ts'
import { DenShop } from './den/shop/index.ts'
import { EcoGift } from './gift/index.ts'
import { AvatarDefinition } from './definitions/avatar/index.ts'
import { DenItemDefinition } from './definitions/den-item/index.ts'
import { DenRoomDefinition } from './definitions/den-room/index.ts'
import { DiamondDefinition } from './definitions/diamond/index.ts'
import { ExchangeDefinition } from './definitions/exchange/index.ts'
import { ItemDefinition } from './definitions/item/index.ts'
import { GenericListDefinition } from './definitions/list/index.ts'
import { MinigameDefinition } from './definitions/minigame/index.ts'
import { PartyDefinition } from './definitions/party/index.ts'
import { PetDefinition } from './definitions/pet/index.ts'
import { QuestDefinition } from './definitions/quest/index.ts'
import { GenericListContent } from './definitions/list-content/index.ts'
import { Item } from './item/index.ts'
import { Jamagram } from './jamagram/index.ts'
import { Masterpiece } from './masterpiece/index.ts'
import { Report } from './moderation/report/index.ts'
import { Sanction } from './moderation/sanction/index.ts'
import { Wall } from './wall/board/index.ts'
import { WallHidden } from './wall/hidden/index.ts'
import { WallPost } from './wall/post/index.ts'
import { Like } from './like/index.ts'
import { MinigameDay } from './minigame/day/index.ts'
import { MinigameScore } from './minigame/score/index.ts'
import { NewspaperSeen } from './newspaper/index.ts'
import { PartySchedule } from './party/schedule/index.ts'
import { Pet } from './pet/index.ts'
import { Player } from './player/index.ts'
import { ItemPrize } from './prize/index.ts'
import { QuestCompletion } from './quest/completion/index.ts'
import { QuestPrize } from './quest/prize/index.ts'
import { Referral } from './referrals/referral/index.ts'
import { ReferralLevel } from './referrals/level/index.ts'
import { RedemptionCode } from './codes/code/index.ts'
import { CodeRedemption } from './codes/redemption/index.ts'
import { RoomDefinition } from './definitions/room/index.ts'
import { WorldItemDefinition } from './definitions/world/index.ts'
import { CommandSettings } from './settings/index.ts'
import { TradeItem } from './trade/item/index.ts'
import { TradeListing } from './trade/listing/index.ts'
import { Trade } from './trade/trade/index.ts'
import { ShopStock } from './shop/stock/index.ts'
import { TransactionCurrency } from './transactions/currency/index.ts'
import { TransactionItem } from './transactions/item/index.ts'
import { Transaction } from './transactions/transaction/index.ts'
import { UserVariable } from './variable/index.ts'

/**
 * Every entity the database holds
 */
export const ENTITIES = [
  Account,
  Session,
  PartyDefinition,
  PartySchedule,
  PasswordReset,
  Confirmation,
  Player,
  CommandSettings,
  NewspaperSeen,
  Like,
  Achievement,
  AchievementDefinition,
  UserVariable,
  RoomDefinition,
  ItemDefinition,
  Item,
  Transaction,
  TransactionCurrency,
  TransactionItem,
  WorldItemClaim,
  EcoGift,
  ItemPrize,
  AvatarDefinition,
  DenItemDefinition,
  DenRoomDefinition,
  PetDefinition,
  PermissionRow,
  Role,
  RoleGrant,
  RoleAssignment,
  PermissionOverride,
  AuditEntry,
  GenericListDefinition,
  Avatar,
  DenRoom,
  DenItem,
  DenLayout,
  DiamondDefinition,
  ExchangeDefinition,
  ShopStock,
  DenShop,
  DenShopListing,
  Buddy,
  BuddyRequest,
  Block,
  Pet,
  TradeListing,
  Trade,
  TradeItem,
  PartyDefinition,
  PartySchedule,
  MinigameDefinition,
  MinigameDay,
  MinigameScore,
  GenericListContent,
  Jamagram,
  Masterpiece,
  Wall,
  WallHidden,
  WallPost,
  Report,
  Sanction,
  Referral,
  WorldItemDefinition,
  ReferralLevel,
  RedemptionCode,
  CodeRedemption,
  QuestDefinition,
  QuestCompletion,
  QuestPrize,
]

export {
  Account,
  Achievement,
  AchievementDefinition,
  AuditEntry,
  Avatar,
  AvatarDefinition,
  Block,
  Buddy,
  BuddyRequest,
  CommandSettings,
  Confirmation,
  DenItem,
  DenItemDefinition,
  DenLayout,
  DenRoom,
  DenRoomDefinition,
  DenShop,
  DenShopListing,
  DiamondDefinition,
  EcoGift,
  ExchangeDefinition,
  GenericListDefinition,
  Item,
  ItemDefinition,
  ItemPrize,
  Jamagram,
  Masterpiece,
  Wall,
  WallHidden,
  WallPost,
  Like,
  MinigameDay,
  MinigameDefinition,
  MinigameScore,
  NewspaperSeen,
  PasswordReset,
  PermissionOverride,
  PermissionRow,
  Pet,
  PetDefinition,
  Player,
  QuestCompletion,
  QuestDefinition,
  QuestPrize,
  Referral,
  Report,
  Sanction,
  GenericListContent,
  Role,
  RoleAssignment,
  RoleGrant,
  RoomDefinition,
  Session,
  ShopStock,
  Trade,
  TradeItem,
  TradeListing,
  Transaction,
  TransactionCurrency,
  TransactionItem,
  UserVariable,
  WorldItemClaim,
  WorldItemDefinition,
  ReferralLevel,
  RedemptionCode,
  CodeRedemption,
}
export { type CodeItem } from './codes/code/index.ts'
export { LIKE_TYPES, type LikeType } from './like/index.ts'
export { PRIZE_SOURCES, type PrizeSource } from './prize/index.ts'
export {
  TRANSACTION_ITEM_KINDS,
  type TransactionItemKind,
} from './transactions/item/index.ts'
export {
  TRANSACTION_KINDS,
  type TransactionKind,
} from './transactions/transaction/index.ts'
export {
  AUDIT_ACTIONS,
  AUDIT_TARGETS,
  type AuditAction,
  type AuditTarget,
} from './access/audit/index.ts'
export {
  OVERRIDE_EFFECTS,
  type OverrideEffect,
} from './access/override/index.ts'
export { PARTY_REPEATS, type PartyRepeat } from './party/schedule/index.ts'
export { type WallFrame, type WallSticker } from './wall/board/index.ts'
export { type PostAvatar } from './wall/post/index.ts'
export {
  type StoredActor,
  type StoredPrize,
} from './definitions/quest/index.ts'
export {
  REPORT_STATUSES,
  type ReportStatus,
} from './moderation/report/index.ts'
export {
  SANCTION_KINDS,
  type SanctionKind,
} from './moderation/sanction/index.ts'
