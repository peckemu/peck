import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * A plant that took root
 */
export type PlantedSeed = {
  /**
   * The plant's actor id
   */
  readonly actorName: string

  /**
   * The seed
   */
  readonly defId: number

  /**
   * Where across
   */
  readonly x: number

  /**
   * Where down
   */
  readonly y: number

  /**
   * The planter's session id
   */
  readonly launcherUserId: number
}

/**
 * A seed count
 * @class
 */
@Packet(Outgoing.QuestSeed, 'xt')
export class QuestSeedOutgoing extends OutgoingPacket {
  /**
   * The seed, or 0
   */
  @Field.int() public readonly defId: number = 0

  /**
   * How many are held
   */
  @Field.int() public readonly count: number = 0

  /**
   * The most held
   */
  @Field.int() public readonly max: number = 0

  /**
   * Sends a seed count
   * @param room The target room
   * @param defId The seed, or 0
   * @param count How many are held
   * @param max The most held
   * @returns The packet
   */
  public static of(
    room: number,
    defId: number,
    count: number,
    max: number,
  ): QuestSeedOutgoing {
    return PacketFactory.create<QuestSeedOutgoing>(QuestSeedOutgoing, {
      room,
      defId,
      count,
      max,
    })
  }
}

/**
 * A seed was planted
 * @class
 */
@Packet(Outgoing.QuestPlant, 'xt')
export class QuestPlantOutgoing extends OutgoingPacket {
  /**
   * Whether it took root
   */
  @Field.int() public readonly planted: number = 0

  /**
   * The planter's username
   */
  @Field.string() public readonly userName: string = ''

  /**
   * The plant
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Says a seed took root
   * @param room The target room
   * @param userName The planter's username
   * @param plant The plant
   * @returns The packet
   */
  public static planted(
    room: number,
    userName: string,
    plant: PlantedSeed,
  ): QuestPlantOutgoing {
    return PacketFactory.create<QuestPlantOutgoing>(QuestPlantOutgoing, {
      room,
      planted: 1,
      userName,
      body: [
        plant.actorName,
        ...[plant.defId, plant.x, plant.y, plant.launcherUserId].map(String),
      ],
    })
  }

  /**
   * Refuses a seed
   * @param room The target room
   * @param userName The planter's username
   * @returns The packet
   */
  public static refused(room: number, userName: string): QuestPlantOutgoing {
    return PacketFactory.create<QuestPlantOutgoing>(QuestPlantOutgoing, {
      room,
      planted: 0,
      userName,
      body: [],
    })
  }
}

/**
 * A plant ate a phantom
 * @class
 */
@Packet(Outgoing.QuestPlantAte, 'xt')
export class QuestPlantAteOutgoing extends OutgoingPacket {
  /**
   * The plant
   */
  @Field.string() public readonly plantActorId: string = ''

  /**
   * The phantom
   */
  @Field.string() public readonly phantomActorId: string = ''

  /**
   * Says a plant ate
   * @param room The target room
   * @param plantActorId The plant
   * @param phantomActorId The phantom
   * @returns The packet
   */
  public static of(
    room: number,
    plantActorId: string,
    phantomActorId: string,
  ): QuestPlantAteOutgoing {
    return PacketFactory.create<QuestPlantAteOutgoing>(QuestPlantAteOutgoing, {
      room,
      plantActorId,
      phantomActorId,
    })
  }
}

/**
 * A plant recoils
 * @class
 */
@Packet(Outgoing.QuestRecoil, 'xt')
export class QuestRecoilOutgoing extends OutgoingPacket {
  /**
   * The plant
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * Says a plant recoils
   * @param room The target room
   * @param actorId The plant
   * @returns The packet
   */
  public static of(room: number, actorId: string): QuestRecoilOutgoing {
    return PacketFactory.create<QuestRecoilOutgoing>(QuestRecoilOutgoing, {
      room,
      actorId,
    })
  }
}
