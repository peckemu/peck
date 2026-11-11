import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A player's health
 */
export type PlayerHealth = {
  /**
   * The player's session id
   */
  readonly userId: number

  /**
   * The change, below 0 for a hit
   */
  readonly change: number

  /**
   * The health now
   */
  readonly health: number

  /**
   * The most health
   */
  readonly maxHealth: number
}

/**
 * A weapon thrown or swung
 */
export type UsedWeapon = {
  /**
   * The weapon
   */
  readonly weaponDefId: number

  /**
   * Where across
   */
  readonly x: number

  /**
   * Where down
   */
  readonly y: number

  /**
   * The actor that used it, or empty
   */
  readonly actorId: string

  /**
   * The player who used it, or 0
   */
  readonly userId: number

  /**
   * Its colour
   */
  readonly color: number
}

/**
 * Works out a health percentage
 * @param health The health
 * @returns The percentage
 */
const percentOf = (health: PlayerHealth): number =>
  health.maxHealth > 0
    ? Math.round((Math.max(0, health.health) * 100) / health.maxHealth)
    : 0

/**
 * An actor attacks a player
 * @class
 */
@Packet(Outgoing.QuestAttack, 'xt')
export class QuestAttackOutgoing extends OutgoingPacket {
  /**
   * The actor
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * The weapon
   */
  @Field.int() public readonly weaponDefId: number = 0

  /**
   * Its colour
   */
  @Field.uint() public readonly color: number = 0

  /**
   * Says an actor attacks a player
   * @param room The target room
   * @param actorId The actor
   * @param userId The player's session id
   * @param weaponDefId The weapon
   * @param color Its colour
   * @returns The packet
   */
  public static of(
    room: number,
    actorId: string,
    userId: number,
    weaponDefId: number,
    color: number,
  ): QuestAttackOutgoing {
    return PacketFactory.create<QuestAttackOutgoing>(QuestAttackOutgoing, {
      room,
      actorId,
      userId,
      weaponDefId,
      color: color >>> 0,
    })
  }
}

/**
 * A beam zaps
 * @class
 */
@Packet(Outgoing.QuestBeamZap, 'xt')
export class QuestBeamZapOutgoing extends OutgoingPacket {
  /**
   * The beam
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Says a beam zaps a player
   * @param room The target room
   * @param actorId The beam
   * @param userId The player's session id
   * @returns The packet
   */
  public static of(
    room: number,
    actorId: string,
    userId: number,
  ): QuestBeamZapOutgoing {
    return PacketFactory.create<QuestBeamZapOutgoing>(QuestBeamZapOutgoing, {
      room,
      actorId,
      userId,
    })
  }
}

/**
 * A phantom zaps a player
 * @class
 */
@Packet(Outgoing.QuestPhantomZap, 'xt')
export class QuestPhantomZapOutgoing extends OutgoingPacket {
  /**
   * The phantom
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Says a phantom zaps a player
   * @param room The target room
   * @param actorId The phantom
   * @param userId The player's session id
   * @returns The packet
   */
  public static of(
    room: number,
    actorId: string,
    userId: number,
  ): QuestPhantomZapOutgoing {
    return PacketFactory.create<QuestPhantomZapOutgoing>(
      QuestPhantomZapOutgoing,
      {
        room,
        actorId,
        userId,
      },
    )
  }
}

/**
 * A player was defeated
 * @class
 */
@Packet(Outgoing.QuestDead, 'xt')
export class QuestDeadOutgoing extends OutgoingPacket {
  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Says a player was defeated
   * @param room The target room
   * @param userId The player's session id
   * @returns The packet
   */
  public static of(room: number, userId: number): QuestDeadOutgoing {
    return PacketFactory.create<QuestDeadOutgoing>(QuestDeadOutgoing, {
      room,
      userId,
    })
  }
}

/**
 * A player may come back
 * @class
 */
@Packet(Outgoing.QuestRespawn, 'xt')
export class QuestRespawnOutgoing extends OutgoingPacket {
  /**
   * Lets the player come back
   * @param room The target room
   * @returns The packet
   */
  public static of(room: number): QuestRespawnOutgoing {
    return PacketFactory.create<QuestRespawnOutgoing>(QuestRespawnOutgoing, {
      room,
    })
  }
}

/**
 * A player's health
 * @class
 */
@Packet(Outgoing.QuestHealth, 'xt')
export class QuestHealthOutgoing extends OutgoingPacket {
  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * The health percentage
   */
  @Field.int() public readonly healthPercent: number = 0

  /**
   * The change
   */
  @Field.int() public readonly change: number = 0

  /**
   * The health now
   */
  @Field.int() public readonly health: number = 0

  /**
   * The most health
   */
  @Field.int() public readonly maxHealth: number = 0

  /**
   * Sends a player's health
   * @param room The target room
   * @param health The health
   * @returns The packet
   */
  public static of(room: number, health: PlayerHealth): QuestHealthOutgoing {
    return PacketFactory.create<QuestHealthOutgoing>(QuestHealthOutgoing, {
      room,
      ...health,
      healthPercent: percentOf(health),
    })
  }
}

/**
 * A player came back
 * @class
 */
@Packet(Outgoing.QuestRespawned, 'xt')
export class QuestRespawnedOutgoing extends OutgoingPacket {
  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * The health percentage
   */
  @Field.int() public readonly healthPercent: number = 0

  /**
   * The change
   */
  @Field.int() public readonly change: number = 0

  /**
   * The health now
   */
  @Field.int() public readonly health: number = 0

  /**
   * The most health
   */
  @Field.int() public readonly maxHealth: number = 0

  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0

  /**
   * Brings a player back
   * @param room The target room
   * @param health The health
   * @param x Where across
   * @param y Where down
   * @returns The packet
   */
  public static of(
    room: number,
    health: PlayerHealth,
    x: number,
    y: number,
  ): QuestRespawnedOutgoing {
    return PacketFactory.create<QuestRespawnedOutgoing>(
      QuestRespawnedOutgoing,
      {
        room,
        ...health,
        healthPercent: percentOf(health),
        x,
        y,
      },
    )
  }
}

/**
 * A weapon was thrown
 * @class
 */
@Packet(Outgoing.QuestThrow, 'xt')
export class QuestThrowOutgoing extends OutgoingPacket {
  /**
   * The weapon
   */
  @Field.int() public readonly weaponDefId: number = 0

  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0

  /**
   * The actor that threw it
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The player who threw it
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Its colour
   */
  @Field.uint() public readonly color: number = 0

  /**
   * Says a weapon was thrown
   * @param room The target room
   * @param weapon The weapon
   * @returns The packet
   */
  public static of(room: number, weapon: UsedWeapon): QuestThrowOutgoing {
    return PacketFactory.create<QuestThrowOutgoing>(QuestThrowOutgoing, {
      room,
      ...weapon,
      color: weapon.color >>> 0,
    })
  }
}

/**
 * A weapon was swung
 * @class
 */
@Packet(Outgoing.QuestSwipe, 'xt')
export class QuestSwipeOutgoing extends OutgoingPacket {
  /**
   * The weapon
   */
  @Field.int() public readonly weaponDefId: number = 0

  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0

  /**
   * The actor that swung it
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The player who swung it
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Its colour
   */
  @Field.uint() public readonly color: number = 0

  /**
   * Says a weapon was swung
   * @param room The target room
   * @param weapon The weapon
   * @returns The packet
   */
  public static of(room: number, weapon: UsedWeapon): QuestSwipeOutgoing {
    return PacketFactory.create<QuestSwipeOutgoing>(QuestSwipeOutgoing, {
      room,
      ...weapon,
      color: weapon.color >>> 0,
    })
  }
}
