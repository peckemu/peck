/**
 * The client packet headers
 */
export const Incoming = {
  /**
   * The client's SmartFox version
   */
  VersionCheck: 'verChk',

  /**
   * Asks for the login key
   */
  RandomKey: 'rndK',

  /**
   * The login
   */
  Login: 'login',

  /**
   * Keeps the connection alive
   */
  KeepAlive: 'ka',

  /**
   * Asks for an activation email
   */
  EmailActivation: 'ves',

  /**
   * The player moves
   */
  Movement: 'au',

  /**
   * A public chat message
   */
  PublicChat: 'pubMsg',

  /**
   * Asks for a generic list
   */
  GenericList: 'gl',

  /**
   * Asks for a wall's token
   */
  WallToken: 'wt',

  /**
   * Sets the player's wall access
   */
  WallSettingsSet: 'wss',

  /**
   * Asks for a wall's access
   */
  WallSettings: 'wsg',

  /**
   * Changes how the player's wall looks
   */
  WallParameters: 'wps',

  /**
   * Counts a visit to a wall
   */
  WallVisit: 'wci',

  /**
   * Asks how many like something
   */
  Likes: 'crg',

  /**
   * Likes something
   */
  Like: 'crp',

  /**
   * Makes the player's first animal
   */
  AvatarFastPass: 'afp',

  /**
   * Asks for a player's avatars
   */
  AvatarList: 'al',

  /**
   * Joins a room
   */
  RoomJoin: 'rj',

  /**
   * Asks for one of a player's avatars
   */
  AvatarData: 'ad',

  /**
   * Recolours the player's animal
   */
  AvatarPaint: 'ap',

  /**
   * Switches the player's animal
   */
  AvatarSwitch: 'as',

  /**
   * Adds another animal
   */
  AvatarAdd: 'aa',

  /**
   * Removes one of the player's animals
   */
  AvatarRemove: 'ak',

  /**
   * Buys another animal slot
   */
  AvatarSlot: 'ab',

  /**
   * Chooses the animals a non-member keeps
   */
  AvatarOrdain: 'ao',

  /**
   * Sets one of the player's pending flags
   */
  AvatarPendingFlag: 'af',

  /**
   * Looks a player up by name
   */
  AvatarLookup: 'ag',

  /**
   * Looks a player up by room id
   */
  AvatarLookupById: 'ags',

  /**
   * Pays for a photo booth picture
   */
  AvatarPhoto: 'apb',

  /**
   * Asks about a photo booth picture
   */
  AvatarPhotoCheck: 'apc',

  /**
   * Asks for an avatar's items
   */
  ItemList: 'il',

  /**
   * Puts clothing on and takes it off
   */
  ItemUse: 'iu',

  /**
   * Asks for a player's pets
   */
  PetList: 'pl',

  /**
   * Adopts a pet
   */
  PetCreate: 'pc',

  /**
   * Adopts a diamond pet
   */
  PetBuy: 'pb',

  /**
   * Chooses the pet to walk with
   */
  PetSwitch: 'ps',

  /**
   * Frees a pet
   */
  PetRelease: 'pd',

  /**
   * Names a hatched egg
   */
  PetName: 'pn',

  /**
   * Changes the pet in the salon
   */
  PetSalon: 'pi',

  /**
   * Shows or hides the mastery badge
   */
  PetMastery: 'pm',

  /**
   * Asks for a player's adopt a pet cards
   */
  AdoptAPets: 'pad',

  /**
   * Asks for an adopt a pet card count
   */
  AdoptAPetCount: 'padc',

  /**
   * Marks adopt a pet cards seen
   */
  AdoptAPetsSeen: 'pads',

  /**
   * Asks for the player's den rooms
   */
  DenRooms: 'dl',

  /**
   * Asks for the player's den items
   */
  DenItems: 'di',

  /**
   * Joins a den
   */
  DenJoin: 'dj',

  /**
   * Saves the den editor's changes
   */
  DenStateSave: 'ds',

  /**
   * Buys clothing
   */
  ItemBuy: 'ib',

  /**
   * Recycles clothing
   */
  ItemRecycle: 'ir',

  /**
   * Buys a den item or den room
   */
  DenBuy: 'db',

  /**
   * Recycles den items or den rooms
   */
  DenRecycle: 'dr',

  /**
   * Changes a den shop stand
   */
  DenShopUpdate: 'dsu',

  /**
   * Asks for a stand's stock
   */
  DenShopItems: 'dsi',

  /**
   * Buys from a den shop stand
   */
  DenShopBuy: 'dsb',

  /**
   * Switches the player's den room
   */
  DenChange: 'dc',

  /**
   * Sets or asks for den privacy
   */
  DenPrivacy: 'dp',

  /**
   * Empties the player's den
   */
  DenEmpty: 'de',

  /**
   * Asks for the epic dens
   */
  DenEpic: 'dh',

  /**
   * Turns the player into a phantom
   */
  DenPhantom: 'dph',

  /**
   * Asks for the den's eco system
   */
  DenEcoState: 'dEf',

  /**
   * Redeems the den's eco credits
   */
  DenEcoRedeem: 'dEr',

  /**
   * Switches a den eco item
   */
  DenEcoConsumer: 'dEc',

  /**
   * Asks for the buddy and blocked lists
   */
  BuddyList: 'bl',

  /**
   * Asks a player to be a buddy
   */
  BuddyRequest: 'ba',

  /**
   * Answers a buddy request
   */
  BuddyAnswer: 'bc',

  /**
   * Ends a buddyship
   */
  BuddyRemove: 'bd',

  /**
   * Asks where a buddy is
   */
  BuddyWhere: 'br',

  /**
   * Blocks a player
   */
  Block: 'bb',

  /**
   * Unblocks a player
   */
  Unblock: 'bu',

  /**
   * Asks whether a player blocks this one
   */
  BlockInfo: 'bi',

  /**
   * Asks for a player's trade list
   */
  TradeList: 'tl',

  /**
   * Changes the trade list
   */
  TradeListChange: 'ts',

  /**
   * Sends the busy state
   */
  TradeBusy: 'tb',

  /**
   * Changes a trade
   */
  TradeAction: 'ti',

  /**
   * Asks for the live parties
   */
  PartyList: 'sl',

  /**
   * Goes to a party
   */
  PartyJoin: 'sj',

  /**
   * Asks for the hosted parties
   */
  HostedPartyList: 'slp',

  /**
   * Hosts a party
   */
  PartyHost: 'scp',

  /**
   * Goes to a party a player hosts
   */
  HostedPartyJoin: 'sjp',

  /**
   * Asks for a hosted party's server
   */
  HostedPartyNode: 'spn',

  /**
   * Asks for a host's time left
   */
  HostingTime: 'sphp',

  /**
   * Asks for the masterpieces
   */
  Masterpieces: 'sm',

  /**
   * Asks about minigames
   */
  MinigameInfo: 'mi',

  /**
   * Joins a minigame
   */
  MinigameJoin: 'mj',

  /**
   * Claims gems won in a minigame
   */
  MinigameGems: 'mg',

  /**
   * Claims mastery points for a pet
   */
  MinigameMastery: 'ma',

  /**
   * Keeps a minigame score
   */
  MinigameScore: 'msv',

  /**
   * Asks for a minigame's leaderboards
   */
  MinigameLeaderboard: 'mlb',

  /**
   * A minigame's own message
   */
  MinigameMessage: 'mm',

  /**
   * Starts a waiting minigame now
   */
  MinigameStart: 'ms',

  /**
   * Leaves a minigame
   */
  MinigameLeave: 'ml',

  /**
   * Asks or answers for a two player game
   */
  MinigamePvp: 'mp',

  /**
   * Joins a hosted two player game
   */
  MinigameCustomPvp: 'mcp',

  /**
   * Asks for the masterpieces in a den
   */
  DenMasterpieces: 'dmi',

  /**
   * Asks for a masterpiece's painter
   */
  MasterpieceCreator: 'dmc',

  /**
   * Asks for the Jam-a-Grams
   */
  JamagramList: 'el',

  /**
   * Sends a Jam-a-Gram
   */
  JamagramSend: 'es',

  /**
   * Opens a Jam-a-Gram
   */
  JamagramRead: 'er',

  /**
   * Deletes a Jam-a-Gram
   */
  JamagramDelete: 'ed',

  /**
   * Accepts or returns a gift
   */
  JamagramGift: 'eg',

  /**
   * Answers a buddy request card
   */
  JamagramBuddy: 'eb',

  /**
   * Clears the inbox cache
   */
  JamagramClear: 'ec',

  /**
   * Changes Jam-a-Gram privacy
   */
  JamagramPrivacy: 'ei',

  /**
   * Leaves a game inside the room
   */
  RoomLeave: 'rl',

  /**
   * Marks a newspaper page seen
   */
  NewspaperSeen: 'nps',

  /**
   * Sets a user variable
   */
  UserVariableSet: 'zs',

  /**
   * Asks for the player's user variables
   */
  UserVariables: 'zg',

  /**
   * Asks for a player's achievements
   */
  Achievements: 'za',

  /**
   * Reports a player
   */
  Report: 'fr',

  /**
   * Reports a player with evidence
   */
  ReportEvidence: 'fra',

  /**
   * Bans a player
   */
  Ban: 'fb',

  /**
   * Silences a player
   */
  Silence: 'fs',

  /**
   * Mutes a player
   */
  Mute: 'fm',

  /**
   * Kicks a player
   */
  Kick: 'fk',

  /**
   * Hides or shows a moderator
   */
  Invisible: 'fi',

  /**
   * An idle timeout
   */
  IdleTimeout: 'ft',

  /**
   * Exchanges one currency for another
   */
  CurrencyExchange: 'ce',

  /**
   * Donates gems
   */
  GemDonation: 'cd',

  /**
   * Buys a shop's whole bundle
   */
  DiamondBundle: 'id',

  /**
   * Asks how many buddies are in each land
   */
  RoomCount: 'rc',

  /**
   * Asks for the shards
   */
  ShardList: 'rm',

  /**
   * Asks for the first five minutes room
   */
  FirstFiveMinutes: 'rf',
} as const

/**
 * Any header the client sends
 */
export type Incoming = (typeof Incoming)[keyof typeof Incoming]
