import { type HandlerType } from '@peck/plugins'

import { AvatarDataHandler } from './avatar/data/index.ts'
import { AvatarFastPassHandler } from './avatar/fastpass/index.ts'
import { AvatarListHandler } from './avatar/list/index.ts'
import { MovementHandler } from './avatar/movement/index.ts'
import { PublicChatHandler } from './chat/public/index.ts'
import { ItemBuyHandler } from './item/buy/index.ts'
import { ItemRecycleHandler } from './item/recycle/index.ts'
import { DenBuyHandler } from './den/buy/index.ts'
import { DenRecycleHandler } from './den/recycle/index.ts'
import { DenShopUpdateHandler } from './den/shop/update/index.ts'
import { DenShopItemsHandler } from './den/shop/items/index.ts'
import { DenShopBuyHandler } from './den/shop/buy/index.ts'
import { BuddyListHandler } from './buddy/list/index.ts'
import { BuddyRequestHandler } from './buddy/request/index.ts'
import { BuddyAnswerHandler } from './buddy/answer/index.ts'
import { BuddyRemoveHandler } from './buddy/remove/index.ts'
import { BuddyWhereHandler } from './buddy/where/index.ts'
import { BlockHandler } from './buddy/block/index.ts'
import { UnblockHandler } from './buddy/unblock/index.ts'
import { BlockInfoHandler } from './buddy/blocked/index.ts'
import { DenStateSaveHandler } from './den/save/index.ts'
import { DenJoinHandler } from './den/join/index.ts'
import { DenItemsHandler } from './den/items/index.ts'
import { DenRoomsHandler } from './den/rooms/index.ts'
import { DenChangeHandler } from './den/change/index.ts'
import { DenPrivacyHandler } from './den/privacy/index.ts'
import { DenEmptyHandler } from './den/empty/index.ts'
import { DenEpicHandler } from './den/epic/index.ts'
import { DenPhantomHandler } from './den/phantom/index.ts'
import { DenEcoStateHandler } from './den/eco/state/index.ts'
import { DenEcoRedeemHandler } from './den/eco/redeem/index.ts'
import { DenEcoConsumerHandler } from './den/eco/consumer/index.ts'
import { MinigameJoinHandler } from './minigame/join/index.ts'
import { MinigameGemsHandler } from './minigame/gems/index.ts'
import { MinigameMasteryHandler } from './minigame/mastery/index.ts'
import { MinigameScoreHandler } from './minigame/score/index.ts'
import { MinigameMessageHandler } from './minigame/message/index.ts'
import { MinigamePvpHandler } from './minigame/pvp/index.ts'
import { MinigameCustomPvpHandler } from './minigame/custom/index.ts'
import { MinigameStartHandler } from './minigame/start/index.ts'
import { MinigameLeaveHandler } from './minigame/leave/index.ts'
import { JamagramListHandler } from './jamagram/list/index.ts'
import { JamagramSendHandler } from './jamagram/send/index.ts'
import { JamagramReadHandler } from './jamagram/read/index.ts'
import { JamagramDeleteHandler } from './jamagram/delete/index.ts'
import { JamagramGiftHandler } from './jamagram/gift/index.ts'
import { JamagramBuddyHandler } from './jamagram/buddy/index.ts'
import { JamagramClearHandler } from './jamagram/clear/index.ts'
import { JamagramPrivacyHandler } from './jamagram/privacy/index.ts'
import { WallSettingsSetHandler } from './wall/settings/index.ts'
import { WallSettingsHandler } from './wall/access/index.ts'
import { WallParametersHandler } from './wall/parameters/index.ts'
import { WallVisitHandler } from './wall/visit/index.ts'
import { LikesHandler } from './like/count/index.ts'
import { LikeHandler } from './like/add/index.ts'
import { AvatarPaintHandler } from './avatar/paint/index.ts'
import { AvatarSwitchHandler } from './avatar/switch/index.ts'
import { AvatarAddHandler } from './avatar/add/index.ts'
import { AvatarRemoveHandler } from './avatar/remove/index.ts'
import { AvatarSlotHandler } from './avatar/slot/index.ts'
import { AvatarOrdainHandler } from './avatar/ordain/index.ts'
import { AvatarPendingFlagHandler } from './avatar/flag/index.ts'
import {
  AvatarLookupByIdHandler,
  AvatarLookupHandler,
} from './avatar/lookup/index.ts'
import {
  AvatarPhotoCheckHandler,
  AvatarPhotoHandler,
} from './avatar/photo/index.ts'
import { BanHandler } from './moderation/ban/index.ts'
import { IdleTimeoutHandler } from './moderation/idle/index.ts'
import { InvisibleHandler } from './moderation/invisible/index.ts'
import { KickHandler } from './moderation/kick/index.ts'
import { MuteHandler } from './moderation/mute/index.ts'
import { ReportEvidenceHandler } from './moderation/evidence/index.ts'
import { ReportHandler } from './moderation/report/index.ts'
import { SilenceHandler } from './moderation/silence/index.ts'
import { ItemUseHandler } from './item/use/index.ts'
import { MasterpiecesHandler } from './masterpiece/board/index.ts'
import { MasterpieceCreatorHandler } from './masterpiece/creator/index.ts'
import { DenMasterpiecesHandler } from './masterpiece/den/index.ts'
import { MinigameLeaderboardHandler } from './minigame/leaderboard/index.ts'
import { RoomLeaveHandler } from './room/leave/index.ts'
import { MinigameInfoHandler } from './minigame/info/index.ts'
import { NewspaperSeenHandler } from './newspaper/seen/index.ts'
import { UserVariableSetHandler } from './player/variable/index.ts'
import { UserVariablesHandler } from './player/variables/index.ts'
import { AchievementsHandler } from './achievement/list/index.ts'
import { GenericListHandler } from './content/list/index.ts'
import { ItemListHandler } from './item/list/index.ts'
import { PetCreateHandler } from './pet/create/index.ts'
import { PartyListHandler } from './party/list/index.ts'
import { HostedPartyListHandler } from './party/hosted/index.ts'
import { PartyJoinHandler } from './party/join/index.ts'
import { PartyHostHandler } from './party/host/index.ts'
import { HostedPartyJoinHandler } from './party/visit/index.ts'
import { HostedPartyNodeHandler } from './party/node/index.ts'
import { HostingTimeHandler } from './party/time/index.ts'
import { PetBuyHandler } from './pet/buy/index.ts'
import { PetSwitchHandler } from './pet/switch/index.ts'
import { PetReleaseHandler } from './pet/release/index.ts'
import { PetNameHandler } from './pet/name/index.ts'
import { PetSalonHandler } from './pet/salon/index.ts'
import { PetMasteryHandler } from './pet/mastery/index.ts'
import {
  AdoptAPetCountHandler,
  AdoptAPetsHandler,
  AdoptAPetsSeenHandler,
} from './pet/adopt/index.ts'
import { PetListHandler } from './pet/list/index.ts'
import { TradeListHandler } from './trade/list/index.ts'
import { TradeListChangeHandler } from './trade/change/index.ts'
import { TradeBusyHandler } from './trade/busy/index.ts'
import { TradeActionHandler } from './trade/action/index.ts'
import { RoomJoinHandler } from './room/join/index.ts'
import { CurrencyExchangeHandler } from './currency/exchange/index.ts'
import { GemDonationHandler } from './currency/donation/index.ts'
import { DiamondBundleHandler } from './item/bundle/index.ts'
import { RoomCountHandler } from './room/count/index.ts'
import { ShardListHandler } from './room/shards/index.ts'
import { FirstFiveMinutesHandler } from './room/ffm/index.ts'
import { QuestJoinHandler } from './quest/join/index.ts'
import { QuestCreateHandler } from './quest/create/index.ts'
import { QuestJoinPrivateHandler } from './quest/private/index.ts'
import { QuestJoinBuddyHandler } from './quest/buddy/index.ts'
import { QuestCancelHandler } from './quest/cancel/index.ts'
import { QuestKickHandler } from './quest/kick/index.ts'
import { QuestStartHandler } from './quest/start/index.ts'
import { QuestExitHandler } from './quest/exit/index.ts'
import {
  QuestTreasureHandler,
  QuestTriggerHandler,
} from './quest/trigger/index.ts'
import {
  QuestDropHandler,
  QuestMovedItemsHandler,
  QuestPickUpHandler,
} from './quest/pickup/index.ts'
import {
  QuestGiftHandler,
  QuestGiftsDoneHandler,
  QuestPlayerGiftHandler,
} from './quest/gift/index.ts'
import {
  QuestPositionHandler,
  QuestScrollHandler,
  QuestSeekHandler,
} from './quest/actor/index.ts'
import {
  QuestAttackHandler,
  QuestBeamZapHandler,
  QuestDestructibleHandler,
  QuestHealHandler,
  QuestHitHandler,
  QuestPhantomZapHandler,
  QuestRespawnHandler,
  QuestSwipeHandler,
  QuestThrowHandler,
} from './quest/combat/index.ts'
import {
  QuestEatHandler,
  QuestPlantAteHandler,
  QuestPlantHandler,
} from './quest/plant/index.ts'
import { KeepAliveHandler } from './session/keepalive/index.ts'
import { RandomKeyHandler } from './session/key/index.ts'
import { LoginHandler } from './session/login/index.ts'
import { VersionCheckHandler } from './session/version/index.ts'
import { WallTokenHandler } from './wall/token/index.ts'
import { ReferralCodeHandler } from './referral/code/index.ts'
import { ReferralAssociatedHandler } from './referral/associated/index.ts'
import { ReferralAssociateHandler } from './referral/associate/index.ts'
import { ReferralListHandler } from './referral/list/index.ts'
import { NodeHopHandler } from './world/hop/index.ts'
import { WorldItemGiftHandler } from './world/gift/index.ts'
import { RedeemCodeHandler } from './currency/redeem/index.ts'

/**
 * The core handlers
 */
export const HANDLERS: readonly HandlerType[] = [
  VersionCheckHandler,
  RandomKeyHandler,
  LoginHandler,
  KeepAliveHandler,
  MovementHandler,
  PublicChatHandler,
  GenericListHandler,
  WallTokenHandler,
  AvatarFastPassHandler,
  AvatarListHandler,
  RoomJoinHandler,
  AvatarDataHandler,
  ItemListHandler,
  PetListHandler,
  DenItemsHandler,
  DenJoinHandler,
  DenRoomsHandler,
  DenChangeHandler,
  DenPrivacyHandler,
  DenEmptyHandler,
  DenEpicHandler,
  DenPhantomHandler,
  DenEcoStateHandler,
  DenEcoRedeemHandler,
  DenEcoConsumerHandler,
  MinigameInfoHandler,
  NewspaperSeenHandler,
  UserVariableSetHandler,
  UserVariablesHandler,
  AchievementsHandler,
  ItemBuyHandler,
  ItemRecycleHandler,
  DenBuyHandler,
  DenRecycleHandler,
  DenShopUpdateHandler,
  DenShopItemsHandler,
  DenShopBuyHandler,
  DenStateSaveHandler,
  BuddyListHandler,
  BuddyRequestHandler,
  BuddyAnswerHandler,
  BuddyRemoveHandler,
  BuddyWhereHandler,
  BlockHandler,
  UnblockHandler,
  BlockInfoHandler,
  PetCreateHandler,
  PetBuyHandler,
  PetSwitchHandler,
  PetReleaseHandler,
  PetNameHandler,
  PetSalonHandler,
  PetMasteryHandler,
  AdoptAPetsHandler,
  AdoptAPetCountHandler,
  AdoptAPetsSeenHandler,
  TradeListHandler,
  TradeListChangeHandler,
  TradeBusyHandler,
  TradeActionHandler,
  PartyListHandler,
  HostedPartyListHandler,
  PartyJoinHandler,
  PartyHostHandler,
  HostedPartyJoinHandler,
  HostedPartyNodeHandler,
  HostingTimeHandler,
  MasterpiecesHandler,
  AvatarPaintHandler,
  AvatarSwitchHandler,
  AvatarAddHandler,
  AvatarRemoveHandler,
  AvatarSlotHandler,
  AvatarOrdainHandler,
  AvatarPendingFlagHandler,
  AvatarLookupHandler,
  AvatarLookupByIdHandler,
  AvatarPhotoHandler,
  AvatarPhotoCheckHandler,
  ItemUseHandler,
  WallSettingsSetHandler,
  WallSettingsHandler,
  WallParametersHandler,
  WallVisitHandler,
  LikesHandler,
  LikeHandler,
  JamagramListHandler,
  JamagramSendHandler,
  JamagramReadHandler,
  JamagramDeleteHandler,
  JamagramGiftHandler,
  JamagramBuddyHandler,
  JamagramClearHandler,
  JamagramPrivacyHandler,
  MasterpieceCreatorHandler,
  DenMasterpiecesHandler,
  MinigameMessageHandler,
  MinigameJoinHandler,
  MinigameGemsHandler,
  MinigameMasteryHandler,
  MinigameScoreHandler,
  MinigameLeaderboardHandler,
  MinigamePvpHandler,
  MinigameCustomPvpHandler,
  MinigameStartHandler,
  MinigameLeaveHandler,
  RoomLeaveHandler,
  ReportHandler,
  ReportEvidenceHandler,
  BanHandler,
  SilenceHandler,
  MuteHandler,
  KickHandler,
  InvisibleHandler,
  IdleTimeoutHandler,
  CurrencyExchangeHandler,
  GemDonationHandler,
  DiamondBundleHandler,
  RoomCountHandler,
  ShardListHandler,
  FirstFiveMinutesHandler,
  QuestJoinHandler,
  QuestCreateHandler,
  QuestJoinPrivateHandler,
  QuestJoinBuddyHandler,
  QuestCancelHandler,
  QuestKickHandler,
  QuestStartHandler,
  QuestExitHandler,
  QuestTriggerHandler,
  QuestTreasureHandler,
  QuestPickUpHandler,
  QuestDropHandler,
  QuestMovedItemsHandler,
  QuestGiftHandler,
  QuestPlayerGiftHandler,
  QuestGiftsDoneHandler,
  QuestPositionHandler,
  QuestSeekHandler,
  QuestScrollHandler,
  QuestHitHandler,
  QuestAttackHandler,
  QuestBeamZapHandler,
  QuestPhantomZapHandler,
  QuestDestructibleHandler,
  QuestHealHandler,
  QuestThrowHandler,
  QuestSwipeHandler,
  QuestRespawnHandler,
  QuestPlantHandler,
  QuestEatHandler,
  QuestPlantAteHandler,
  ReferralCodeHandler,
  ReferralAssociatedHandler,
  ReferralAssociateHandler,
  ReferralListHandler,
  NodeHopHandler,
  WorldItemGiftHandler,
  RedeemCodeHandler,
]

export {
  ReferralCodeHandler,
  ReferralAssociatedHandler,
  ReferralAssociateHandler,
  ReferralListHandler,
  NodeHopHandler,
  WorldItemGiftHandler,
  RedeemCodeHandler,
  ReportHandler,
  ReportEvidenceHandler,
  BanHandler,
  SilenceHandler,
  MuteHandler,
  KickHandler,
  InvisibleHandler,
  IdleTimeoutHandler,
  CurrencyExchangeHandler,
  GemDonationHandler,
  DiamondBundleHandler,
  RoomCountHandler,
  ShardListHandler,
  FirstFiveMinutesHandler,
  QuestJoinHandler,
  QuestCreateHandler,
  QuestJoinPrivateHandler,
  QuestJoinBuddyHandler,
  QuestCancelHandler,
  QuestKickHandler,
  QuestStartHandler,
  QuestExitHandler,
  QuestTriggerHandler,
  QuestTreasureHandler,
  QuestPickUpHandler,
  QuestDropHandler,
  QuestMovedItemsHandler,
  QuestGiftHandler,
  QuestPlayerGiftHandler,
  QuestGiftsDoneHandler,
  QuestPositionHandler,
  QuestSeekHandler,
  QuestScrollHandler,
  QuestHitHandler,
  QuestAttackHandler,
  QuestBeamZapHandler,
  QuestPhantomZapHandler,
  QuestDestructibleHandler,
  QuestHealHandler,
  QuestThrowHandler,
  QuestSwipeHandler,
  QuestRespawnHandler,
  QuestPlantHandler,
  QuestEatHandler,
  QuestPlantAteHandler,
  AvatarPaintHandler,
  AvatarSwitchHandler,
  AvatarAddHandler,
  AvatarRemoveHandler,
  AvatarSlotHandler,
  AvatarOrdainHandler,
  AvatarPendingFlagHandler,
  AvatarLookupHandler,
  AvatarLookupByIdHandler,
  AvatarPhotoHandler,
  AvatarPhotoCheckHandler,
  ItemUseHandler,
  WallSettingsSetHandler,
  WallSettingsHandler,
  WallParametersHandler,
  WallVisitHandler,
  LikesHandler,
  LikeHandler,
  JamagramListHandler,
  JamagramSendHandler,
  JamagramReadHandler,
  JamagramDeleteHandler,
  JamagramGiftHandler,
  JamagramBuddyHandler,
  JamagramClearHandler,
  JamagramPrivacyHandler,
  MasterpieceCreatorHandler,
  DenMasterpiecesHandler,
  MinigameMessageHandler,
  MinigameJoinHandler,
  MinigameGemsHandler,
  MinigameMasteryHandler,
  MinigameScoreHandler,
  MinigameLeaderboardHandler,
  MinigamePvpHandler,
  MinigameCustomPvpHandler,
  MinigameStartHandler,
  MinigameLeaveHandler,
  RoomLeaveHandler,
  PartyListHandler,
  HostedPartyListHandler,
  PartyJoinHandler,
  PartyHostHandler,
  HostedPartyJoinHandler,
  HostedPartyNodeHandler,
  HostingTimeHandler,
  MasterpiecesHandler,
  TradeListHandler,
  TradeListChangeHandler,
  TradeBusyHandler,
  TradeActionHandler,
  PetCreateHandler,
  PetBuyHandler,
  PetSwitchHandler,
  PetReleaseHandler,
  PetNameHandler,
  PetSalonHandler,
  PetMasteryHandler,
  AdoptAPetsHandler,
  AdoptAPetCountHandler,
  AdoptAPetsSeenHandler,
  BuddyListHandler,
  BuddyRequestHandler,
  BuddyAnswerHandler,
  BuddyRemoveHandler,
  BuddyWhereHandler,
  BlockHandler,
  UnblockHandler,
  BlockInfoHandler,
  DenStateSaveHandler,
  ItemBuyHandler,
  ItemRecycleHandler,
  DenBuyHandler,
  DenRecycleHandler,
  DenShopUpdateHandler,
  DenShopItemsHandler,
  DenShopBuyHandler,
  DenJoinHandler,
  DenItemsHandler,
  DenRoomsHandler,
  DenChangeHandler,
  DenPrivacyHandler,
  DenEmptyHandler,
  DenEpicHandler,
  DenPhantomHandler,
  DenEcoStateHandler,
  DenEcoRedeemHandler,
  DenEcoConsumerHandler,
  MinigameInfoHandler,
  NewspaperSeenHandler,
  UserVariableSetHandler,
  UserVariablesHandler,
  AchievementsHandler,
  AvatarDataHandler,
  AvatarFastPassHandler,
  AvatarListHandler,
  GenericListHandler,
  ItemListHandler,
  KeepAliveHandler,
  LoginHandler,
  MovementHandler,
  PetListHandler,
  PublicChatHandler,
  RandomKeyHandler,
  RoomJoinHandler,
  VersionCheckHandler,
  WallTokenHandler,
}
