import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * The actor type named by its definition's name
 */
const NAMED = 16

/**
 * An actor as an adventure starts
 */
export type StartingActor = {
  /**
   * Its id
   */
  readonly actorId: string

  /**
   * Its type
   */
  readonly type: number

  /**
   * Its definition
   */
  readonly defId: number

  /**
   * Its definition's name
   */
  readonly defName: string

  /**
   * Its state
   */
  readonly state: number

  /**
   * Whether it shows
   */
  readonly visible: boolean

  /**
   * Whether it needs a click
   */
  readonly requireClick: boolean

  /**
   * The path it walks, or empty
   */
  readonly pathName: string

  /**
   * Its animation state, or empty
   */
  readonly swfState: string
}

/**
 * An adventure starts
 * @class
 */
@Packet(Outgoing.QuestStart, 'xt')
export class QuestStartOutgoing extends OutgoingPacket {
  /**
   * The adventure
   */
  @Field.int() public readonly scriptDefId: number = 0

  /**
   * How many play
   */
  @Field.int() public readonly playerCount: number = 0

  /**
   * The actors
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Starts an adventure
   * @param room The target room
   * @param scriptDefId The adventure
   * @param playerCount How many play
   * @param timestamp The script's timestamp
   * @param actors The actors
   * @returns The packet
   */
  public static of(
    room: number,
    scriptDefId: number,
    playerCount: number,
    timestamp: string,
    actors: readonly StartingActor[],
  ): QuestStartOutgoing {
    const body = [
      String(actors.length),
      timestamp,
      ...actors.flatMap((actor) => [
        actor.actorId,
        String(actor.type),
        actor.type === NAMED ? actor.defName : String(actor.defId),
        String(actor.state),
        actor.visible ? '1' : '0',
        actor.requireClick ? '1' : '0',
        actor.pathName,
        actor.swfState,
      ]),
    ]

    return PacketFactory.create<QuestStartOutgoing>(QuestStartOutgoing, {
      room,
      scriptDefId,
      playerCount,
      body,
    })
  }

  /**
   * Says the adventure did not start
   * @param room The target room
   * @param scriptDefId The adventure
   * @returns The packet
   */
  public static failed(room: number, scriptDefId: number): QuestStartOutgoing {
    return PacketFactory.create<QuestStartOutgoing>(QuestStartOutgoing, {
      room,
      scriptDefId,
      playerCount: 0,
      body: ['-1'],
    })
  }
}
