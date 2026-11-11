import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Why an adventure was refused
 */
export const QuestRefusal = {
  /**
   * No such adventure
   */
  Invalid: 'NV',

  /**
   * The adventure is full
   */
  Full: 'FULL',

  /**
   * Land animals only
   */
  Land: 'NLAND',

  /**
   * Ocean animals only
   */
  Ocean: 'NOCEAN',

  /**
   * Flying animals only
   */
  Air: 'NAIR',

  /**
   * Land or flying animals only
   */
  LandAir: 'NLANDAIR',

  /**
   * Members only
   */
  Members: 'NM',

  /**
   * Blocked by the host
   */
  Blocked: 'NB',

  /**
   * The level is too low
   */
  Level: 'NL',

  /**
   * Already adventuring
   */
  Busy: 'NAIL',

  /**
   * The level is too low for hard mode
   */
  HardLevel: 'NDL',

  /**
   * No private adventure
   */
  Missing: 'NQ',

  /**
   * Needs a pet
   */
  Pet: 'NP',

  /**
   * Not this animal
   */
  Animal: 'NA',
} as const

export type QuestRefusal = (typeof QuestRefusal)[keyof typeof QuestRefusal]

/**
 * Whether an adventure was joined
 * @class
 */
abstract class JoinPacket extends OutgoingPacket {
  /**
   * Whether it was joined
   */
  @Field.int() public readonly joined: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []
}

/**
 * Lists a refusal
 * @param refusal Why
 * @param detail The level or restriction, or null
 * @returns The fields
 */
const refusalBody = (
  refusal: QuestRefusal,
  detail: number | null,
): readonly string[] =>
  detail === null ? [refusal] : [refusal, String(detail)]

/**
 * Whether a public adventure was joined
 * @class
 */
@Packet(Outgoing.QuestJoin, 'xt')
export class QuestJoinOutgoing extends JoinPacket {
  /**
   * Says the lobby was joined
   * @param room The target room
   * @param adventureId The adventure's instance
   * @param scriptDefId The adventure
   * @param difficulty Normal 0 or hard 1
   * @returns The packet
   */
  public static joined(
    room: number,
    adventureId: number,
    scriptDefId: number,
    difficulty: number,
  ): QuestJoinOutgoing {
    return PacketFactory.create<QuestJoinOutgoing>(QuestJoinOutgoing, {
      room,
      joined: 1,
      body: [adventureId, scriptDefId, difficulty].map(String),
    })
  }

  /**
   * Refuses an adventure
   * @param room The target room
   * @param refusal Why
   * @param detail The level or restriction, or null
   * @returns The packet
   */
  public static refused(
    room: number,
    refusal: QuestRefusal,
    detail: number | null = null,
  ): QuestJoinOutgoing {
    return PacketFactory.create<QuestJoinOutgoing>(QuestJoinOutgoing, {
      room,
      joined: 0,
      body: refusalBody(refusal, detail),
    })
  }
}

/**
 * Whether a private adventure was opened
 * @class
 */
@Packet(Outgoing.QuestCreate, 'xt')
export class QuestCreateOutgoing extends JoinPacket {
  /**
   * Says the private lobby was opened
   * @param room The target room
   * @param adventureId The adventure's instance
   * @param scriptDefId The adventure
   * @returns The packet
   */
  public static joined(
    room: number,
    adventureId: number,
    scriptDefId: number,
  ): QuestCreateOutgoing {
    return PacketFactory.create<QuestCreateOutgoing>(QuestCreateOutgoing, {
      room,
      joined: 1,
      body: [adventureId, scriptDefId].map(String),
    })
  }

  /**
   * Refuses a private adventure
   * @param room The target room
   * @param refusal Why
   * @param detail The level or restriction, or null
   * @returns The packet
   */
  public static refused(
    room: number,
    refusal: QuestRefusal,
    detail: number | null = null,
  ): QuestCreateOutgoing {
    return PacketFactory.create<QuestCreateOutgoing>(QuestCreateOutgoing, {
      room,
      joined: 0,
      body: refusalBody(refusal, detail),
    })
  }
}

/**
 * Whether a private adventure was joined
 * @class
 */
@Packet(Outgoing.QuestJoinPrivate, 'xt')
export class QuestJoinPrivateOutgoing extends JoinPacket {
  /**
   * Says the private lobby was joined
   * @param room The target room
   * @param adventureId The adventure's instance
   * @param scriptDefId The adventure
   * @param difficulty Normal 0 or hard 1
   * @returns The packet
   */
  public static joined(
    room: number,
    adventureId: number,
    scriptDefId: number,
    difficulty: number,
  ): QuestJoinPrivateOutgoing {
    return PacketFactory.create<QuestJoinPrivateOutgoing>(
      QuestJoinPrivateOutgoing,
      {
        room,
        joined: 1,
        body: [adventureId, scriptDefId, difficulty].map(String),
      },
    )
  }

  /**
   * Refuses a private adventure
   * @param room The target room
   * @param refusal Why
   * @param detail The level or restriction, or null
   * @returns The packet
   */
  public static refused(
    room: number,
    refusal: QuestRefusal,
    detail: number | null = null,
  ): QuestJoinPrivateOutgoing {
    return PacketFactory.create<QuestJoinPrivateOutgoing>(
      QuestJoinPrivateOutgoing,
      {
        room,
        joined: 0,
        body: refusalBody(refusal, detail),
      },
    )
  }
}

/**
 * Who waits in a lobby
 * @class
 */
@Packet(Outgoing.QuestWaiting, 'xt')
export class QuestWaitingOutgoing extends OutgoingPacket {
  /**
   * The players' session ids
   */
  @Field.rest(Field.int()) public readonly userIds: readonly number[] = []

  /**
   * Lists who waits
   * @param room The target room
   * @param userIds The players' session ids
   * @returns The packet
   */
  public static of(
    room: number,
    userIds: readonly number[],
  ): QuestWaitingOutgoing {
    return PacketFactory.create<QuestWaitingOutgoing>(QuestWaitingOutgoing, {
      room,
      userIds,
    })
  }
}

/**
 * A lobby was left
 * @class
 */
@Packet(Outgoing.QuestCancel, 'xt')
export class QuestCancelOutgoing extends OutgoingPacket {
  /**
   * Says the lobby was left
   * @param room The target room
   * @returns The packet
   */
  public static of(room: number): QuestCancelOutgoing {
    return PacketFactory.create<QuestCancelOutgoing>(QuestCancelOutgoing, {
      room,
    })
  }
}
