import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A party in the list
 */
export type ListedParty = {
  /**
   * The party
   */
  readonly defId: number

  /**
   * Seconds to the start
   */
  readonly secondsToStart: number

  /**
   * Seconds left
   */
  readonly secondsToEnd: number
}

/**
 * A hosted party
 */
export type ListedHostedParty = {
  /**
   * The host's uuid
   */
  readonly hostUuid: string

  /**
   * Its name
   */
  readonly name: string

  /**
   * Its server
   */
  readonly node: string

  /**
   * The party
   */
  readonly defId: number

  /**
   * Seconds left
   */
  readonly secondsLeft: number
}

/**
 * Why a party was refused
 */
export const PartyRefusal = {
  /**
   * Members only
   */
  Members: 'NM',

  /**
   * Not this animal
   */
  Animal: 'NA',

  /**
   * Needs a pet out
   */
  Pet: 'NP',

  /**
   * Not on
   */
  Ended: 'NE',
} as const

export type PartyRefusal = (typeof PartyRefusal)[keyof typeof PartyRefusal]

/**
 * Why hosting a party was refused
 */
export const HostRefusal = {
  /**
   * Not enough diamonds
   */
  Diamonds: 'ND',

  /**
   * Already hosting
   */
  Hosting: 'EXISTS',

  /**
   * Members only
   */
  Members: 'NM',

  /**
   * Not pickable
   */
  Invalid: 'INV',

  /**
   * Can't right now
   */
  Refused: 'NR',
} as const

export type HostRefusal = (typeof HostRefusal)[keyof typeof HostRefusal]

/**
 * A status packet
 */
abstract class StatusPacket extends OutgoingPacket {
  /**
   * The status
   */
  @Field.string() public readonly status: string = '0'

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []
}

/**
 * The parties on and coming
 * @class
 */
@Packet(Outgoing.PartyList, 'xt')
export class PartyListOutgoing extends StatusPacket {
  /**
   * Lists the parties
   * @param room The target room
   * @param parties The parties
   * @returns The packet
   */
  public static of(
    room: number,
    parties: readonly ListedParty[],
  ): PartyListOutgoing {
    const body = [
      String(parties.length),
      ...parties.flatMap(({ defId, secondsToStart, secondsToEnd }) =>
        [defId, secondsToStart, secondsToEnd].map(String),
      ),
    ]

    return PacketFactory.create<PartyListOutgoing>(PartyListOutgoing, {
      room,
      status: '1',
      body,
    })
  }
}

/**
 * Why a party was refused
 * @class
 */
@Packet(Outgoing.PartyJoin, 'xt')
export class PartyJoinOutgoing extends StatusPacket {
  /**
   * Refuses a party
   * @param room The target room
   * @param reason Why
   * @param defId The party
   * @returns The packet
   */
  public static refused(
    room: number,
    reason: PartyRefusal,
    defId: number,
  ): PartyJoinOutgoing {
    const withDef =
      reason === PartyRefusal.Animal || reason === PartyRefusal.Pet

    return PacketFactory.create<PartyJoinOutgoing>(PartyJoinOutgoing, {
      room,
      status: '0',
      body: withDef ? [reason, String(defId)] : [reason],
    })
  }
}

/**
 * The parties players host
 * @class
 */
@Packet(Outgoing.HostedPartyList, 'xt')
export class HostedPartyListOutgoing extends StatusPacket {
  /**
   * Lists hosted parties
   * @param room The target room
   * @param total The total
   * @param start The first listed
   * @param parties The page
   * @returns The packet
   */
  public static of(
    room: number,
    total: number,
    start: number,
    parties: readonly ListedHostedParty[],
  ): HostedPartyListOutgoing {
    const page = parties.flatMap((party) => [
      party.hostUuid,
      party.name,
      party.node,
      String(party.defId),
      String(party.secondsLeft),
    ])
    const body =
      total > 0
        ? [
            String(total),
            String(start),
            String(parties.length),
            String(parties.length),
            ...page,
          ]
        : ['0']

    return PacketFactory.create<HostedPartyListOutgoing>(
      HostedPartyListOutgoing,
      {
        room,
        status: '1',
        body,
      },
    )
  }
}

/**
 * Whether a party was hosted
 * @class
 */
@Packet(Outgoing.PartyHost, 'xt')
export class PartyHostOutgoing extends StatusPacket {
  /**
   * Says the party is on
   * @param room The target room
   * @param secondsLeft How long it lasts
   * @returns The packet
   */
  public static hosted(room: number, secondsLeft: number): PartyHostOutgoing {
    return PacketFactory.create<PartyHostOutgoing>(PartyHostOutgoing, {
      room,
      status: '1',
      body: ['1', String(secondsLeft)],
    })
  }

  /**
   * Says why it couldn't be hosted
   * @param room The target room
   * @param reason Why
   * @returns The packet
   */
  public static refused(room: number, reason: HostRefusal): PartyHostOutgoing {
    return PacketFactory.create<PartyHostOutgoing>(PartyHostOutgoing, {
      room,
      status: '0',
      body: [reason],
    })
  }
}

/**
 * Whether a hosted party was joined
 * @class
 */
@Packet(Outgoing.HostedPartyJoin, 'xt')
export class HostedPartyJoinOutgoing extends StatusPacket {
  /**
   * Says the party was joined
   * @param room The target room
   * @returns The packet
   */
  public static joined(room: number): HostedPartyJoinOutgoing {
    return PacketFactory.create<HostedPartyJoinOutgoing>(
      HostedPartyJoinOutgoing,
      {
        room,
        status: '1',
        body: [],
      },
    )
  }

  /**
   * Says why it couldn't be joined
   * @param room The target room
   * @param reason Why
   * @returns The packet
   */
  public static refused(
    room: number,
    reason: 'NPP' | 'BLK' | 'DIS',
  ): HostedPartyJoinOutgoing {
    return PacketFactory.create<HostedPartyJoinOutgoing>(
      HostedPartyJoinOutgoing,
      {
        room,
        status: '0',
        body: [reason],
      },
    )
  }
}

/**
 * A hosted party's server
 * @class
 */
@Packet(Outgoing.HostedPartyNode, 'xt')
export class HostedPartyNodeOutgoing extends StatusPacket {
  /**
   * Says where the party is
   * @param room The target room
   * @param hostUuid The host's uuid
   * @param node The server
   * @returns The packet
   */
  public static found(
    room: number,
    hostUuid: string,
    node: string,
  ): HostedPartyNodeOutgoing {
    return PacketFactory.create<HostedPartyNodeOutgoing>(
      HostedPartyNodeOutgoing,
      {
        room,
        status: '1',
        body: [hostUuid, node],
      },
    )
  }

  /**
   * Says there is no such party
   * @param room The target room
   * @returns The packet
   */
  public static missing(room: number): HostedPartyNodeOutgoing {
    return PacketFactory.create<HostedPartyNodeOutgoing>(
      HostedPartyNodeOutgoing,
      {
        room,
        status: '0',
        body: [],
      },
    )
  }
}

/**
 * How long a player has left hosting
 * @class
 */
@Packet(Outgoing.HostingTime, 'xt')
export class HostingTimeOutgoing extends OutgoingPacket {
  /**
   * Seconds left
   */
  @Field.int() public readonly secondsLeft: number = 0

  /**
   * Sends the time left
   * @param room The target room
   * @param secondsLeft Seconds left
   * @returns The packet
   */
  public static of(room: number, secondsLeft: number): HostingTimeOutgoing {
    return PacketFactory.create<HostingTimeOutgoing>(HostingTimeOutgoing, {
      room,
      secondsLeft,
    })
  }
}

/**
 * A masterpiece on the party board
 */
export type BoardMasterpiece = {
  /**
   * Its id
   */
  readonly uniqueImageId: string

  /**
   * Its frame
   */
  readonly frame: number

  /**
   * The painter's username
   */
  readonly creatorName: string

  /**
   * The painter
   */
  readonly creatorGameId: number

  /**
   * The painter's uuid
   */
  readonly creatorUuid: string
}

/**
 * The masterpieces
 * @class
 */
@Packet(Outgoing.Masterpieces, 'xt')
export class MasterpiecesOutgoing extends OutgoingPacket {
  /**
   * The masterpieces
   */
  @Field.string() public readonly json: string = ''

  /**
   * Says there are none
   * @param room The target room
   * @returns The packet
   */
  public static none(room: number): MasterpiecesOutgoing {
    return PacketFactory.create<MasterpiecesOutgoing>(MasterpiecesOutgoing, {
      room,
      json: '',
    })
  }

  /**
   * Lists masterpieces for the board
   * @param room The target room
   * @param pool The masterpieces
   * @returns The packet
   */
  public static of(
    room: number,
    pool: readonly BoardMasterpiece[],
  ): MasterpiecesOutgoing {
    if (pool.length === 0) return MasterpiecesOutgoing.none(room)

    const json = JSON.stringify({
      pool: pool.map((art) => ({
        frameId: art.frame,
        resourceId: art.uniqueImageId,
        userName: art.creatorName,
        creatorDBId: art.creatorGameId,
        creatorId: art.creatorUuid,
      })),
    })

    return PacketFactory.create<MasterpiecesOutgoing>(MasterpiecesOutgoing, {
      room,
      json,
    })
  }
}
