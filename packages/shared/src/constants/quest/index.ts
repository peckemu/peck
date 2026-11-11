/**
 * What an adventure prize is
 */
export const QuestPrizeKind = {
  /**
   * A den item
   */
  DenItem: 1,

  /**
   * A clothing item
   */
  Clothing: 2,

  /**
   * Gems
   */
  Gems: 3,

  /**
   * Crystals
   */
  Crystals: 4,

  /**
   * Nothing, closing the chest
   */
  Reset: 5,

  /**
   * Nothing, opening the chest
   */
  Open: 6,
} as const

export type QuestPrizeKind =
  (typeof QuestPrizeKind)[keyof typeof QuestPrizeKind]

/**
 * The kinds of adventure actor
 */
export const QuestActorType = {
  /**
   * Taken by walking onto it
   */
  Pickup: 1,

  /**
   * A phantom
   */
  Phantom: 11,

  /**
   * A phantom boss
   */
  Boss: 12,

  /**
   * A treasure chest
   */
  Treasure: 13,

  /**
   * An item carried
   */
  Item: 15,

  /**
   * Named by its definition's name
   */
  Named: 16,

  /**
   * An item in a group
   */
  GroupItem: 17,

  /**
   * A plant
   */
  Plant: 21,

  /**
   * Something phantoms break
   */
  Destructible: 23,

  /**
   * Treasure an actor dropped
   */
  DroppedTreasure: 200,
} as const

export type QuestActorType =
  (typeof QuestActorType)[keyof typeof QuestActorType]

/**
 * What a pick up came to
 */
export const QuestPickUpResult = {
  /**
   * Already carrying something
   */
  Holding: 0,

  /**
   * Picked up
   */
  PickedUp: 1,

  /**
   * Refused
   */
  Refused: 2,

  /**
   * Put down
   */
  Dropped: 3,

  /**
   * Put down with its radii
   */
  Placed: 4,
} as const

export type QuestPickUpResult =
  (typeof QuestPickUpResult)[keyof typeof QuestPickUpResult]
