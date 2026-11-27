import { QuestActorType, QuestPrizeKind } from '@peck/shared'

import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'
import { type ShownPrize } from '../prize/index.ts'

/**
 * Where an actor is
 */
export type ActorPosition = {
  /**
   * The actor
   */
  readonly actorId: string

  /**
   * Where across
   */
  readonly x: number

  /**
   * Where down
   */
  readonly y: number

  /**
   * How fast it walks
   */
  readonly velocity: number

  /**
   * What it seeks
   */
  readonly seekType: number

  /**
   * The nearest player across
   */
  readonly nearestX: number

  /**
   * The nearest player down
   */
  readonly nearestY: number
}

/**
 * An actor appears
 * @class
 */
@Packet(Outgoing.QuestSpawn, 'xt')
export class QuestSpawnOutgoing extends OutgoingPacket {
  /**
   * The actor it came from
   */
  @Field.string() public readonly spawnedFrom: string = ''

  /**
   * The new actor
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * Its type
   */
  @Field.int() public readonly type: number = 0

  /**
   * Its definition
   */
  @Field.int() public readonly defId: number = 0

  /**
   * What follows its type
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Drops a treasure
   * @param room The target room
   * @param spawnedFrom The actor that dropped it
   * @param actorId The treasure
   * @param prize What it holds
   * @returns The packet
   */
  public static treasure(
    room: number,
    spawnedFrom: string,
    actorId: string,
    prize: ShownPrize,
  ): QuestSpawnOutgoing {
    const held =
      prize.kind === QuestPrizeKind.Clothing
        ? [prize.value, prize.color >>> 0]
        : [prize.value]

    return PacketFactory.create<QuestSpawnOutgoing>(QuestSpawnOutgoing, {
      room,
      spawnedFrom,
      actorId,
      type: QuestActorType.DroppedTreasure,
      defId: prize.kind === QuestPrizeKind.Clothing ? prize.value : 0,
      body: [prize.kind, ...held].map(String),
    })
  }

  /**
   * Spawns an actor
   * @param room The target room
   * @param spawnedFrom The actor it came from
   * @param actorId The new actor
   * @param type Its type
   * @param defId Its definition
   * @param offset Where around the spawner, or null
   * @returns The packet
   */
  public static of(
    room: number,
    spawnedFrom: string,
    actorId: string,
    type: number,
    defId: number,
    offset: readonly [number, number] | null = null,
  ): QuestSpawnOutgoing {
    return PacketFactory.create<QuestSpawnOutgoing>(QuestSpawnOutgoing, {
      room,
      spawnedFrom,
      actorId,
      type,
      defId,
      body: offset ? offset.map(String) : [],
    })
  }
}

/**
 * An actor moved
 * @class
 */
@Packet(Outgoing.QuestPosition, 'xt')
export class QuestPositionOutgoing extends OutgoingPacket {
  /**
   * The actor
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0

  /**
   * How fast it walks
   */
  @Field.int() public readonly velocity: number = 0

  /**
   * What it seeks
   */
  @Field.int() public readonly seekType: number = 0

  /**
   * The nearest player across
   */
  @Field.int() public readonly nearestX: number = 0

  /**
   * The nearest player down
   */
  @Field.int() public readonly nearestY: number = 0

  /**
   * Says where an actor is
   * @param room The target room
   * @param position Where it is
   * @returns The packet
   */
  public static of(
    room: number,
    position: ActorPosition,
  ): QuestPositionOutgoing {
    return PacketFactory.create<QuestPositionOutgoing>(QuestPositionOutgoing, {
      room,
      ...position,
    })
  }
}

/**
 * An actor seeks
 * @class
 */
@Packet(Outgoing.QuestSeek, 'xt')
export class QuestSeekOutgoing extends OutgoingPacket {
  /**
   * The actor
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * What it seeks
   */
  @Field.int() public readonly seekType: number = 0

  /**
   * The player who asked
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Says what an actor seeks
   * @param room The target room
   * @param actorId The actor
   * @param seekType What it seeks
   * @param userId The player who asked
   * @returns The packet
   */
  public static of(
    room: number,
    actorId: string,
    seekType: number,
    userId: number,
  ): QuestSeekOutgoing {
    return PacketFactory.create<QuestSeekOutgoing>(QuestSeekOutgoing, {
      room,
      actorId,
      seekType,
      userId,
    })
  }
}

/**
 * An actor was hit
 * @class
 */
@Packet(Outgoing.QuestActorHealth, 'xt')
export class QuestActorHealthOutgoing extends OutgoingPacket {
  /**
   * The actor
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * Its health, or -1
   */
  @Field.int() public readonly healthPercent: number = 0

  /**
   * The damage and whether it was fierce
   */
  @Field.rest(Field.int()) public readonly body: readonly number[] = []

  /**
   * Says an actor was hit
   * @param room The target room
   * @param actorId The actor
   * @param healthPercent Its health
   * @param damage The damage
   * @param fierce Whether it was fierce
   * @returns The packet
   */
  public static hit(
    room: number,
    actorId: string,
    healthPercent: number,
    damage: number,
    fierce: boolean,
  ): QuestActorHealthOutgoing {
    return PacketFactory.create<QuestActorHealthOutgoing>(
      QuestActorHealthOutgoing,
      {
        room,
        actorId,
        healthPercent,
        body: [damage, fierce ? 1 : 0],
      },
    )
  }

  /**
   * Says an attack missed
   * @param room The target room
   * @param actorId The actor
   * @returns The packet
   */
  public static missed(
    room: number,
    actorId: string,
  ): QuestActorHealthOutgoing {
    return PacketFactory.create<QuestActorHealthOutgoing>(
      QuestActorHealthOutgoing,
      {
        room,
        actorId,
        healthPercent: -1,
        body: [],
      },
    )
  }
}

/**
 * An actor was defeated
 * @class
 */
@Packet(Outgoing.QuestDeath, 'xt')
export class QuestDeathOutgoing extends OutgoingPacket {
  /**
   * The actor
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The damage dealt
   */
  @Field.int() public readonly damage: number = 0

  /**
   * Whether it moves first
   */
  @Field.int() public readonly moved: number = 0

  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0

  /**
   * The actor put there, or empty
   */
  @Field.string() public readonly otherActorId: string = ''

  /**
   * Says an actor was defeated
   * @param room The target room
   * @param actorId The actor
   * @param damage The damage dealt
   * @param at Where it moves first, or null
   * @param otherActorId The actor put there, or empty
   * @returns The packet
   */
  public static of(
    room: number,
    actorId: string,
    damage: number,
    at: readonly [number, number] | null = null,
    otherActorId = '',
  ): QuestDeathOutgoing {
    return PacketFactory.create<QuestDeathOutgoing>(QuestDeathOutgoing, {
      room,
      actorId,
      damage,
      moved: at ? 1 : 0,
      x: at?.[0] ?? 0,
      y: at?.[1] ?? 0,
      otherActorId,
    })
  }
}

/**
 * An actor came back
 * @class
 */
@Packet(Outgoing.QuestRestore, 'xt')
export class QuestRestoreOutgoing extends OutgoingPacket {
  /**
   * The actor
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * Its health
   */
  @Field.int() public readonly healthPercent: number = 0

  /**
   * Brings an actor back
   * @param room The target room
   * @param actorId The actor
   * @param healthPercent Its health
   * @returns The packet
   */
  public static of(
    room: number,
    actorId: string,
    healthPercent: number,
  ): QuestRestoreOutgoing {
    return PacketFactory.create<QuestRestoreOutgoing>(QuestRestoreOutgoing, {
      room,
      actorId,
      healthPercent,
    })
  }
}

/**
 * An actor's animation changes
 * @class
 */
@Packet(Outgoing.QuestSwfState, 'xt')
export class QuestSwfStateOutgoing extends OutgoingPacket {
  /**
   * The actor
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The animation state
   */
  @Field.string() public readonly swfState: string = ''

  /**
   * Changes an actor's animation
   * @param room The target room
   * @param actorId The actor
   * @param swfState The animation state
   * @returns The packet
   */
  public static of(
    room: number,
    actorId: string,
    swfState: string,
  ): QuestSwfStateOutgoing {
    return PacketFactory.create<QuestSwfStateOutgoing>(QuestSwfStateOutgoing, {
      room,
      actorId,
      swfState,
    })
  }
}

/**
 * An actor walks another path
 * @class
 */
@Packet(Outgoing.QuestPath, 'xt')
export class QuestPathOutgoing extends OutgoingPacket {
  /**
   * The actor
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The path
   */
  @Field.string() public readonly pathName: string = ''

  /**
   * Sets an actor's path
   * @param room The target room
   * @param actorId The actor
   * @param pathName The path
   * @returns The packet
   */
  public static of(
    room: number,
    actorId: string,
    pathName: string,
  ): QuestPathOutgoing {
    return PacketFactory.create<QuestPathOutgoing>(QuestPathOutgoing, {
      room,
      actorId,
      pathName,
    })
  }
}

/**
 * An actor's icon shows or hides
 * @class
 */
@Packet(Outgoing.QuestIcon, 'xt')
export class QuestIconOutgoing extends OutgoingPacket {
  /**
   * The actor
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * Whether it shows
   */
  @Field.int() public readonly showing: number = 0

  /**
   * Shows or hides an actor's icon
   * @param room The target room
   * @param actorId The actor
   * @param showing Whether it shows
   * @returns The packet
   */
  public static of(
    room: number,
    actorId: string,
    showing: boolean,
  ): QuestIconOutgoing {
    return PacketFactory.create<QuestIconOutgoing>(QuestIconOutgoing, {
      room,
      actorId,
      showing: showing ? 1 : 0,
    })
  }
}

/**
 * A volume's progress
 * @class
 */
@Packet(Outgoing.QuestVolume, 'xt')
export class QuestVolumeOutgoing extends OutgoingPacket {
  /**
   * The volume
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * Its progress
   */
  @Field.int() public readonly progress: number = 0

  /**
   * Sends a volume's progress
   * @param room The target room
   * @param actorId The volume
   * @param progress Its progress
   * @returns The packet
   */
  public static of(
    room: number,
    actorId: string,
    progress: number,
  ): QuestVolumeOutgoing {
    return PacketFactory.create<QuestVolumeOutgoing>(QuestVolumeOutgoing, {
      room,
      actorId,
      progress,
    })
  }
}

/**
 * A torch is lit or put out
 * @class
 */
@Packet(Outgoing.QuestTorch, 'xt')
export class QuestTorchOutgoing extends OutgoingPacket {
  /**
   * An actor 0 or a player 1
   */
  @Field.int() public readonly target: number = 0

  /**
   * Whether it is lit
   */
  @Field.int() public readonly lit: number = 0

  /**
   * The actor or the player's session id
   */
  @Field.string() public readonly holder: string = ''

  /**
   * Lights or puts out an actor's torch
   * @param room The target room
   * @param actorId The actor
   * @param lit Whether it is lit
   * @returns The packet
   */
  public static actor(
    room: number,
    actorId: string,
    lit: boolean,
  ): QuestTorchOutgoing {
    return PacketFactory.create<QuestTorchOutgoing>(QuestTorchOutgoing, {
      room,
      target: 0,
      lit: lit ? 1 : 0,
      holder: actorId,
    })
  }

  /**
   * Lights or puts out a player's torch
   * @param room The target room
   * @param userId The player's session id
   * @param lit Whether it is lit
   * @returns The packet
   */
  public static player(
    room: number,
    userId: number,
    lit: boolean,
  ): QuestTorchOutgoing {
    return PacketFactory.create<QuestTorchOutgoing>(QuestTorchOutgoing, {
      room,
      target: 1,
      lit: lit ? 1 : 0,
      holder: String(userId),
    })
  }
}
