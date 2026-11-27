import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * Experience earned
 */
export type EarnedXp = {
  /**
   * The experience just earned
   */
  readonly earned: number

  /**
   * The experience in all
   */
  readonly totalXp: number

  /**
   * The level before
   */
  readonly previousLevel: number

  /**
   * The level now
   */
  readonly level: number

  /**
   * The way to the next level
   */
  readonly levelProgress: number

  /**
   * The actor that gave it, or empty
   */
  readonly actorId: string
}

/**
 * Adventure experience earned
 * @class
 */
@Packet(Outgoing.QuestXp, 'xt')
export class QuestXpOutgoing extends OutgoingPacket {
  /**
   * The experience just earned
   */
  @Field.int() public readonly earned: number = 0

  /**
   * The experience in all
   */
  @Field.int() public readonly totalXp: number = 0

  /**
   * The level before
   */
  @Field.int() public readonly previousLevel: number = 0

  /**
   * The level now
   */
  @Field.int() public readonly level: number = 0

  /**
   * The way to the next level
   */
  @Field.number() public readonly levelProgress: number = 0

  /**
   * The actor that gave it
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * Sends the experience
   * @param room The target room
   * @param xp The experience
   * @returns The packet
   */
  public static of(room: number, xp: EarnedXp): QuestXpOutgoing {
    return PacketFactory.create<QuestXpOutgoing>(QuestXpOutgoing, {
      room,
      ...xp,
    })
  }
}

/**
 * A player levelled up
 * @class
 */
@Packet(Outgoing.QuestLevel, 'xt')
export class QuestLevelOutgoing extends OutgoingPacket {
  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * The new level
   */
  @Field.int() public readonly level: number = 0

  /**
   * Says a player levelled up
   * @param room The target room
   * @param userId The player's session id
   * @param level The new level
   * @returns The packet
   */
  public static of(
    room: number,
    userId: number,
    level: number,
  ): QuestLevelOutgoing {
    return PacketFactory.create<QuestLevelOutgoing>(QuestLevelOutgoing, {
      room,
      userId,
      level,
    })
  }
}

/**
 * An adventure award
 * @class
 */
@Packet(Outgoing.QuestAward, 'xt')
export class QuestAwardOutgoing extends OutgoingPacket {
  /**
   * The user variable
   */
  @Field.int() public readonly userVarId: number = 0

  /**
   * Its value
   */
  @Field.int() public readonly value: number = 0

  /**
   * Awards a user variable
   * @param room The target room
   * @param userVarId The user variable
   * @param value Its value
   * @returns The packet
   */
  public static of(
    room: number,
    userVarId: number,
    value: number,
  ): QuestAwardOutgoing {
    return PacketFactory.create<QuestAwardOutgoing>(QuestAwardOutgoing, {
      room,
      userVarId,
      value,
    })
  }
}

/**
 * The crystals gathered
 * @class
 */
@Packet(Outgoing.QuestCrystals, 'xt')
export class QuestCrystalsOutgoing extends OutgoingPacket {
  /**
   * How many
   */
  @Field.int() public readonly crystals: number = 0

  /**
   * Sends the crystals gathered
   * @param room The target room
   * @param crystals How many
   * @returns The packet
   */
  public static of(room: number, crystals: number): QuestCrystalsOutgoing {
    return PacketFactory.create<QuestCrystalsOutgoing>(QuestCrystalsOutgoing, {
      room,
      crystals,
    })
  }
}

/**
 * The player's attack and defence
 * @class
 */
@Packet(Outgoing.QuestStats, 'xt')
export class QuestStatsOutgoing extends OutgoingPacket {
  /**
   * The least a hit does
   */
  @Field.int() public readonly attackBase: number = 0

  /**
   * The most a hit does
   */
  @Field.int() public readonly attackMax: number = 0

  /**
   * The least defence
   */
  @Field.int() public readonly defenseBase: number = 0

  /**
   * The most defence
   */
  @Field.int() public readonly defenseMax: number = 0

  /**
   * Sends the attack and defence
   * @param room The target room
   * @param attack The least and most a hit does
   * @param defense The least and most defence
   * @returns The packet
   */
  public static of(
    room: number,
    attack: readonly [number, number],
    defense: readonly [number, number],
  ): QuestStatsOutgoing {
    return PacketFactory.create<QuestStatsOutgoing>(QuestStatsOutgoing, {
      room,
      attackBase: attack[0],
      attackMax: attack[1],
      defenseBase: defense[0],
      defenseMax: defense[1],
    })
  }
}
