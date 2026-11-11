import { RoleAssignment } from '#database/entities/access/assignment'
import { AuditEntry } from '#database/entities/access/audit'
import { RoleGrant } from '#database/entities/access/grant'
import { PermissionOverride } from '#database/entities/access/override'
import { PermissionRow } from '#database/entities/access/permission'
import { Role } from '#database/entities/access/role'
import { Account } from '#database/entities/accounts/account'
import { Confirmation } from '#database/entities/accounts/confirmation'
import { PasswordReset } from '#database/entities/accounts/reset'
import { Session } from '#database/entities/accounts/session'
import { Achievement } from '#database/entities/achievement'
import { AchievementDefinition } from '#database/entities/definitions/achievement'
import { Avatar } from '#database/entities/avatar'
import { Block } from '#database/entities/buddies/block'
import { Buddy } from '#database/entities/buddies/buddy'
import { BuddyRequest } from '#database/entities/buddies/request'
import { WorldItemClaim } from '#database/entities/claim'
import { DenItem } from '#database/entities/den/item'
import { DenLayout } from '#database/entities/den/layout'
import { DenShopListing } from '#database/entities/den/listing'
import { DenRoom } from '#database/entities/den/room'
import { DenShop } from '#database/entities/den/shop'
import { EcoGift } from '#database/entities/gift'
import { AvatarDefinition } from '#database/entities/definitions/avatar'
import { DenItemDefinition } from '#database/entities/definitions/den-item'
import { DenRoomDefinition } from '#database/entities/definitions/den-room'
import { DiamondDefinition } from '#database/entities/definitions/diamond'
import { ExchangeDefinition } from '#database/entities/definitions/exchange'
import { ItemDefinition } from '#database/entities/definitions/item'
import { GenericListDefinition } from '#database/entities/definitions/list'
import { MinigameDefinition } from '#database/entities/definitions/minigame'
import { PartyDefinition } from '#database/entities/definitions/party'
import { PetDefinition } from '#database/entities/definitions/pet'
import { GenericListContent } from '#database/entities/definitions/list-content'
import { Item } from '#database/entities/item'
import { Jamagram } from '#database/entities/jamagram'
import { Masterpiece } from '#database/entities/masterpiece'
import { Report } from '#database/entities/moderation/report'
import { Sanction } from '#database/entities/moderation/sanction'
import { Wall } from '#database/entities/wall/board'
import { WallHidden } from '#database/entities/wall/hidden'
import { WallPost } from '#database/entities/wall/post'
import { Like } from '#database/entities/like'
import { MinigameDay } from '#database/entities/minigame/day'
import { MinigameScore } from '#database/entities/minigame/score'
import { NewspaperSeen } from '#database/entities/newspaper'
import { PartySchedule } from '#database/entities/party/schedule'
import { Pet } from '#database/entities/pet'
import { Player } from '#database/entities/player'
import { ItemPrize } from '#database/entities/prize'
import { RoomDefinition } from '#database/entities/definitions/room'
import { CommandSettings } from '#database/entities/settings'
import { TradeItem } from '#database/entities/trade/item'
import { TradeListing } from '#database/entities/trade/listing'
import { Trade } from '#database/entities/trade/trade'
import { ShopStock } from '#database/entities/shop/stock'
import { TransactionCurrency } from '#database/entities/transactions/currency'
import { TransactionItem } from '#database/entities/transactions/item'
import { Transaction } from '#database/entities/transactions/transaction'
import { UserVariable } from '#database/entities/variable'

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
}
export { LIKE_TYPES, type LikeType } from '#database/entities/like'
export { PRIZE_SOURCES, type PrizeSource } from '#database/entities/prize'
export {
  TRANSACTION_ITEM_KINDS,
  type TransactionItemKind,
} from '#database/entities/transactions/item'
export {
  TRANSACTION_KINDS,
  type TransactionKind,
} from '#database/entities/transactions/transaction'
export {
  AUDIT_ACTIONS,
  AUDIT_TARGETS,
  type AuditAction,
  type AuditTarget,
} from '#database/entities/access/audit'
export {
  OVERRIDE_EFFECTS,
  type OverrideEffect,
} from '#database/entities/access/override'
export {
  PARTY_REPEATS,
  type PartyRepeat,
} from '#database/entities/party/schedule'
export { type WallFrame, type WallSticker } from '#database/entities/wall/board'
export { type PostAvatar } from '#database/entities/wall/post'
export {
  REPORT_STATUSES,
  type ReportStatus,
} from '#database/entities/moderation/report'
export {
  SANCTION_KINDS,
  type SanctionKind,
} from '#database/entities/moderation/sanction'
