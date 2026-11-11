import { type HandlerType } from '@peck/plugins'

import { AvatarDataHandler } from '#emulator/handlers/avatar/data'
import { AvatarFastPassHandler } from '#emulator/handlers/avatar/fastpass'
import { AvatarListHandler } from '#emulator/handlers/avatar/list'
import { MovementHandler } from '#emulator/handlers/avatar/movement'
import { PublicChatHandler } from '#emulator/handlers/chat/public'
import { ItemBuyHandler } from '#emulator/handlers/item/buy'
import { ItemRecycleHandler } from '#emulator/handlers/item/recycle'
import { DenBuyHandler } from '#emulator/handlers/den/buy'
import { DenRecycleHandler } from '#emulator/handlers/den/recycle'
import { DenShopUpdateHandler } from '#emulator/handlers/den/shop/update'
import { DenShopItemsHandler } from '#emulator/handlers/den/shop/items'
import { DenShopBuyHandler } from '#emulator/handlers/den/shop/buy'
import { BuddyListHandler } from '#emulator/handlers/buddy/list'
import { BuddyRequestHandler } from '#emulator/handlers/buddy/request'
import { BuddyAnswerHandler } from '#emulator/handlers/buddy/answer'
import { BuddyRemoveHandler } from '#emulator/handlers/buddy/remove'
import { BuddyWhereHandler } from '#emulator/handlers/buddy/where'
import { BlockHandler } from '#emulator/handlers/buddy/block'
import { UnblockHandler } from '#emulator/handlers/buddy/unblock'
import { BlockInfoHandler } from '#emulator/handlers/buddy/blocked'
import { DenStateSaveHandler } from '#emulator/handlers/den/save'
import { DenJoinHandler } from '#emulator/handlers/den/join'
import { DenItemsHandler } from '#emulator/handlers/den/items'
import { DenRoomsHandler } from '#emulator/handlers/den/rooms'
import { DenChangeHandler } from '#emulator/handlers/den/change'
import { DenPrivacyHandler } from '#emulator/handlers/den/privacy'
import { DenEmptyHandler } from '#emulator/handlers/den/empty'
import { DenEpicHandler } from '#emulator/handlers/den/epic'
import { DenPhantomHandler } from '#emulator/handlers/den/phantom'
import { DenEcoStateHandler } from '#emulator/handlers/den/eco/state'
import { DenEcoRedeemHandler } from '#emulator/handlers/den/eco/redeem'
import { DenEcoConsumerHandler } from '#emulator/handlers/den/eco/consumer'
import { MinigameJoinHandler } from '#emulator/handlers/minigame/join'
import { MinigameGemsHandler } from '#emulator/handlers/minigame/gems'
import { MinigameMasteryHandler } from '#emulator/handlers/minigame/mastery'
import { MinigameScoreHandler } from '#emulator/handlers/minigame/score'
import { MinigameMessageHandler } from '#emulator/handlers/minigame/message'
import { MinigamePvpHandler } from '#emulator/handlers/minigame/pvp'
import { MinigameCustomPvpHandler } from '#emulator/handlers/minigame/custom'
import { MinigameStartHandler } from '#emulator/handlers/minigame/start'
import { MinigameLeaveHandler } from '#emulator/handlers/minigame/leave'
import { JamagramListHandler } from '#emulator/handlers/jamagram/list'
import { JamagramSendHandler } from '#emulator/handlers/jamagram/send'
import { JamagramReadHandler } from '#emulator/handlers/jamagram/read'
import { JamagramDeleteHandler } from '#emulator/handlers/jamagram/delete'
import { JamagramGiftHandler } from '#emulator/handlers/jamagram/gift'
import { JamagramBuddyHandler } from '#emulator/handlers/jamagram/buddy'
import { JamagramClearHandler } from '#emulator/handlers/jamagram/clear'
import { JamagramPrivacyHandler } from '#emulator/handlers/jamagram/privacy'
import { WallSettingsSetHandler } from '#emulator/handlers/wall/settings'
import { WallSettingsHandler } from '#emulator/handlers/wall/access'
import { WallParametersHandler } from '#emulator/handlers/wall/parameters'
import { WallVisitHandler } from '#emulator/handlers/wall/visit'
import { LikesHandler } from '#emulator/handlers/like/count'
import { LikeHandler } from '#emulator/handlers/like/add'
import { AvatarPaintHandler } from '#emulator/handlers/avatar/paint'
import { AvatarSwitchHandler } from '#emulator/handlers/avatar/switch'
import { AvatarAddHandler } from '#emulator/handlers/avatar/add'
import { AvatarRemoveHandler } from '#emulator/handlers/avatar/remove'
import { AvatarSlotHandler } from '#emulator/handlers/avatar/slot'
import { AvatarOrdainHandler } from '#emulator/handlers/avatar/ordain'
import { AvatarPendingFlagHandler } from '#emulator/handlers/avatar/flag'
import {
  AvatarLookupByIdHandler,
  AvatarLookupHandler,
} from '#emulator/handlers/avatar/lookup'
import {
  AvatarPhotoCheckHandler,
  AvatarPhotoHandler,
} from '#emulator/handlers/avatar/photo'
import { BanHandler } from '#emulator/handlers/moderation/ban'
import { IdleTimeoutHandler } from '#emulator/handlers/moderation/idle'
import { InvisibleHandler } from '#emulator/handlers/moderation/invisible'
import { KickHandler } from '#emulator/handlers/moderation/kick'
import { MuteHandler } from '#emulator/handlers/moderation/mute'
import { ReportEvidenceHandler } from '#emulator/handlers/moderation/evidence'
import { ReportHandler } from '#emulator/handlers/moderation/report'
import { SilenceHandler } from '#emulator/handlers/moderation/silence'
import { ItemUseHandler } from '#emulator/handlers/item/use'
import { MasterpiecesHandler } from '#emulator/handlers/masterpiece/board'
import { MasterpieceCreatorHandler } from '#emulator/handlers/masterpiece/creator'
import { DenMasterpiecesHandler } from '#emulator/handlers/masterpiece/den'
import { MinigameLeaderboardHandler } from '#emulator/handlers/minigame/leaderboard'
import { RoomLeaveHandler } from '#emulator/handlers/room/leave'
import { MinigameInfoHandler } from '#emulator/handlers/minigame/info'
import { NewspaperSeenHandler } from '#emulator/handlers/newspaper/seen'
import { UserVariableSetHandler } from '#emulator/handlers/player/variable'
import { UserVariablesHandler } from '#emulator/handlers/player/variables'
import { AchievementsHandler } from '#emulator/handlers/achievement/list'
import { GenericListHandler } from '#emulator/handlers/content/list'
import { ItemListHandler } from '#emulator/handlers/item/list'
import { PetCreateHandler } from '#emulator/handlers/pet/create'
import { PartyListHandler } from '#emulator/handlers/party/list'
import { HostedPartyListHandler } from '#emulator/handlers/party/hosted'
import { PartyJoinHandler } from '#emulator/handlers/party/join'
import { PartyHostHandler } from '#emulator/handlers/party/host'
import { HostedPartyJoinHandler } from '#emulator/handlers/party/visit'
import { HostedPartyNodeHandler } from '#emulator/handlers/party/node'
import { HostingTimeHandler } from '#emulator/handlers/party/time'
import { PetBuyHandler } from '#emulator/handlers/pet/buy'
import { PetSwitchHandler } from '#emulator/handlers/pet/switch'
import { PetReleaseHandler } from '#emulator/handlers/pet/release'
import { PetNameHandler } from '#emulator/handlers/pet/name'
import { PetSalonHandler } from '#emulator/handlers/pet/salon'
import { PetMasteryHandler } from '#emulator/handlers/pet/mastery'
import {
  AdoptAPetCountHandler,
  AdoptAPetsHandler,
  AdoptAPetsSeenHandler,
} from '#emulator/handlers/pet/adopt'
import { PetListHandler } from '#emulator/handlers/pet/list'
import { TradeListHandler } from '#emulator/handlers/trade/list'
import { TradeListChangeHandler } from '#emulator/handlers/trade/change'
import { TradeBusyHandler } from '#emulator/handlers/trade/busy'
import { TradeActionHandler } from '#emulator/handlers/trade/action'
import { RoomJoinHandler } from '#emulator/handlers/room/join'
import { CurrencyExchangeHandler } from '#emulator/handlers/currency/exchange'
import { GemDonationHandler } from '#emulator/handlers/currency/donation'
import { DiamondBundleHandler } from '#emulator/handlers/item/bundle'
import { RoomCountHandler } from '#emulator/handlers/room/count'
import { ShardListHandler } from '#emulator/handlers/room/shards'
import { FirstFiveMinutesHandler } from '#emulator/handlers/room/ffm'
import { KeepAliveHandler } from '#emulator/handlers/session/keepalive'
import { RandomKeyHandler } from '#emulator/handlers/session/key'
import { LoginHandler } from '#emulator/handlers/session/login'
import { VersionCheckHandler } from '#emulator/handlers/session/version'
import { WallTokenHandler } from '#emulator/handlers/wall/token'

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
]

export {
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
