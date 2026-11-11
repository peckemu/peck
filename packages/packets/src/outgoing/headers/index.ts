/**
 * The server packet headers
 */
export const Outgoing = {
  /**
   * The SmartFox version is accepted
   */
  ApiOk: 'apiOK',

  /**
   * The SmartFox version is refused
   */
  ApiObsolete: 'apiKO',

  /**
   * The login key
   */
  RandomKey: 'rndK',

  /**
   * How the login went
   */
  LoginResult: 'login',

  /**
   * Whether the activation email went out
   */
  EmailActivation: 'ves',

  /**
   * The email was validated
   */
  EmailValidated: 'vea',

  /**
   * Avatars in the room moved
   */
  Movement: 'au',

  /**
   * Someone in the room spoke
   */
  RoomChat: 'uc',

  /**
   * Every one of the player's user variables
   */
  UserVariables: 'zg',

  /**
   * The unlocked pet kinds
   */
  PetsUnlocked: 'pu',

  /**
   * A generic list
   */
  GenericList: 'gl',

  /**
   * A wall's token
   */
  WallToken: 'wt',

  /**
   * Whether the wall setting was kept
   */
  WallSettingsSet: 'wss',

  /**
   * Who may open a wall
   */
  WallSettings: 'wsg',

  /**
   * Whether the wall's look was kept
   */
  WallParameters: 'wps',

  /**
   * Whether a visit was counted
   */
  WallVisit: 'wci',

  /**
   * How many like something
   */
  Likes: 'crg',

  /**
   * Whether a like was taken
   */
  Like: 'crp',

  /**
   * Whether the first animal was made
   */
  AvatarFastPass: 'afp',

  /**
   * A player's avatars
   */
  AvatarList: 'al',

  /**
   * An avatar appears in the room
   */
  AvatarJoined: 'ac',

  /**
   * An avatar leaves the room
   */
  AvatarLeft: 'ar',

  /**
   * Whether the player joined a room
   */
  RoomJoin: 'rj',

  /**
   * What room to load
   */
  RoomProperties: 'rp',

  /**
   * One of a player's avatars
   */
  AvatarData: 'ad',

  /**
   * Whether the animal was recoloured
   */
  AvatarPaint: 'ap',

  /**
   * A player's name bar changed
   */
  NameBar: 'an',

  /**
   * Someone switched animals
   */
  AvatarSwitch: 'as',

  /**
   * Whether another animal was added
   */
  AvatarAdd: 'aa',

  /**
   * Whether an animal was removed
   */
  AvatarRemove: 'ak',

  /**
   * Whether another animal slot was bought
   */
  AvatarSlot: 'ab',

  /**
   * Whether the kept animals were taken
   */
  AvatarOrdain: 'ao',

  /**
   * A player looked up
   */
  AvatarLookup: 'ag',

  /**
   * The gems left
   */
  AvatarPhoto: 'apb',

  /**
   * Whether a photo can be paid for
   */
  AvatarPhotoCheck: 'apc',

  /**
   * An avatar's items
   */
  ItemList: 'il',

  /**
   * Whether the clothing changed
   */
  ItemUse: 'iu',

  /**
   * A player's pets
   */
  PetList: 'pl',

  /**
   * Whether a pet was adopted
   */
  PetCreate: 'pc',

  /**
   * A player's pet
   */
  PetSwitch: 'ps',

  /**
   * Whether a pet was freed
   */
  PetRelease: 'pd',

  /**
   * A pet was named
   */
  PetName: 'pn',

  /**
   * The restyled pet
   */
  PetSalon: 'pi',

  /**
   * The rebadged pet
   */
  PetMastery: 'pm',

  /**
   * A player's adopt a pet cards
   */
  AdoptAPets: 'pad',

  /**
   * How many adopt a pet cards a player has
   */
  AdoptAPetCount: 'padc',

  /**
   * The player's den rooms
   */
  DenRooms: 'dl',

  /**
   * The player's den items
   */
  DenItems: 'di',

  /**
   * The den's placed items
   */
  DenState: 'ds',

  /**
   * Which den items were saved
   */
  DenStateSaved: 'dss',

  /**
   * Whether clothing was bought
   */
  ItemBuy: 'ib',

  /**
   * The recycled clothing
   */
  ItemRecycle: 'ir',

  /**
   * Whether a den item or den room was bought
   */
  DenBuy: 'db',

  /**
   * The recycled den items or rooms
   */
  DenRecycle: 'dr',

  /**
   * Whether a den shop stand changed
   */
  DenShopUpdate: 'dsu',

  /**
   * A stand's stock
   */
  DenShopItems: 'dsi',

  /**
   * Something bought from a den shop stand
   */
  DenShopBuy: 'dsb',

  /**
   * The den room switched to
   */
  DenChange: 'dc',

  /**
   * A player's den privacy
   */
  DenPrivacy: 'dp',

  /**
   * The player was sent out of a den
   */
  DenKicked: 'dpk',

  /**
   * The den was emptied
   */
  DenEmpty: 'de',

  /**
   * The epic dens
   */
  DenEpic: 'dh',

  /**
   * A player turned into a phantom
   */
  DenPhantom: 'dph',

  /**
   * The den's eco system
   */
  DenEcoState: 'dEf',

  /**
   * Whether the eco credits were redeemed
   */
  DenEcoRedeem: 'dEr',

  /**
   * The den's eco item switches
   */
  DenEcoConsumer: 'dEc',

  /**
   * The buddy or blocked list
   */
  BuddyList: 'bl',

  /**
   * What came of a buddy request
   */
  BuddyRequest: 'ba',

  /**
   * A buddy changed
   */
  BuddyStatus: 'bs',

  /**
   * A buddyship ended
   */
  BuddyRemove: 'bd',

  /**
   * Where a buddy is
   */
  BuddyWhere: 'br',

  /**
   * Whether a player was blocked
   */
  Block: 'bb',

  /**
   * Whether a player was unblocked
   */
  Unblock: 'bu',

  /**
   * Whether a player blocks this one
   */
  BlockInfo: 'bi',

  /**
   * A player's trade list
   */
  TradeList: 'tl',

  /**
   * What happened to a trade
   */
  Trade: 'ti',

  /**
   * The parties on and coming
   */
  PartyList: 'sl',

  /**
   * Why a party was refused
   */
  PartyJoin: 'sj',

  /**
   * The parties players host
   */
  HostedPartyList: 'slp',

  /**
   * Whether a party was hosted
   */
  PartyHost: 'scp',

  /**
   * Whether a hosted party was joined
   */
  HostedPartyJoin: 'sjp',

  /**
   * A hosted party's server
   */
  HostedPartyNode: 'spn',

  /**
   * How long a player has left hosting
   */
  HostingTime: 'sphp',

  /**
   * The masterpieces
   */
  Masterpieces: 'sm',

  /**
   * A balance changed
   */
  Currency: 'cu',

  /**
   * Minigames
   */
  MinigameInfo: 'mi',

  /**
   * Who is playing
   */
  MinigameJoin: 'mj',

  /**
   * A minigame starts
   */
  MinigameStart: 'ms',

  /**
   * The next gem award serial
   */
  MinigameGems: 'mg',

  /**
   * The next mastery award serial
   */
  MinigameMastery: 'ma',

  /**
   * A minigame's leaderboards
   */
  MinigameLeaderboard: 'mlb',

  /**
   * A player left a minigame
   */
  MinigameLeft: 'ml',

  /**
   * A minigame's room is empty
   */
  MinigameEmpty: 'mr',

  /**
   * A minigame's own message
   */
  MinigameMessage: 'mm',

  /**
   * A two player game asked for or turned down
   */
  MinigamePvp: 'mp',

  /**
   * The masterpieces in a den
   */
  DenMasterpieces: 'dmi',

  /**
   * Who painted a masterpiece
   */
  MasterpieceCreator: 'dmc',

  /**
   * The Jam-a-Grams
   */
  JamagramList: 'el',

  /**
   * A Jam-a-Gram arrived
   */
  JamagramPush: 'ep',

  /**
   * Whether a Jam-a-Gram was sent
   */
  JamagramSend: 'es',

  /**
   * Whether a Jam-a-Gram was opened
   */
  JamagramRead: 'er',

  /**
   * The Jam-a-Grams deleted
   */
  JamagramDelete: 'ed',

  /**
   * Whether a gift was kept
   */
  JamagramGift: 'eg',

  /**
   * The answer to a buddy request card
   */
  JamagramBuddy: 'eb',

  /**
   * Whether the privacy changed
   */
  JamagramPrivacy: 'ei',

  /**
   * A newspaper page was seen
   */
  NewspaperSeen: 'nps',

  /**
   * A user variable changed
   */
  UserVariableChanged: 'zs',

  /**
   * A player's achievements
   */
  Achievements: 'za',

  /**
   * A staff action notice
   */
  ModerationNotice: 'fd',

  /**
   * Whether a report was taken
   */
  Report: 'fr',

  /**
   * Whether a report with evidence was taken
   */
  ReportEvidence: 'fra',

  /**
   * Whether a ban worked
   */
  Ban: 'fb',

  /**
   * Whether a silence worked
   */
  Silence: 'fs',

  /**
   * Whether a mute worked
   */
  Mute: 'fm',

  /**
   * Whether a kick worked
   */
  Kick: 'fk',

  /**
   * A moderator's unseen state
   */
  Invisible: 'fi',

  /**
   * Whether an exchange worked
   */
  CurrencyExchange: 'ce',

  /**
   * Whether a donation worked
   */
  GemDonation: 'cd',

  /**
   * Whether a bundle was bought
   */
  DiamondBundle: 'id',

  /**
   * How many buddies are in each land
   */
  RoomCount: 'rc',

  /**
   * The shards
   */
  ShardList: 'rm',

  /**
   * Whether the first five minutes room is ready
   */
  FirstFiveMinutes: 'rf',
} as const

/**
 * Any header the server sends
 */
export type Outgoing = (typeof Outgoing)[keyof typeof Outgoing]
