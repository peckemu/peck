import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The room type of a party
 */
const PARTY_ROOM_TYPE = 5

/**
 * The room type of a den
 */
const DEN_ROOM_TYPE = 2

/**
 * A den to load
 */
export type LoadedDen = {
  /**
   * The room it loads
   */
  readonly pathName: string

  /**
   * Land 0 or ocean 1
   */
  readonly enviroType: number

  /**
   * The den room's definition id
   */
  readonly denDefId: number

  /**
   * The room's definition id
   */
  readonly roomDefId: number
}

/**
 * What room to load
 * @class
 */
@Packet(Outgoing.RoomProperties, 'xt')
export class RoomPropertiesOutgoing extends OutgoingPacket {
  /**
   * The room's name
   */
  @Field.string() public readonly pathName: string = ''

  /**
   * Land 0, ocean 1 or both 2
   */
  @Field.int() public readonly environmentType: number = 0

  /**
   * The kind of room
   */
  @Field.int() public readonly roomType: number = 0

  /**
   * The party or den, or 0
   */
  @Field.int() public readonly secondaryDefId: number = 0

  /**
   * How far it is zoomed
   */
  @Field.int() public readonly zoom: number = 100

  /**
   * The room's def id
   */
  @Field.int() public readonly roomDefId: number = 0

  /**
   * Extra room data
   */
  @Field.string() public readonly customData: string = ''

  /**
   * Sends the room to load
   * @param roomId The instance's id
   * @param room The room
   * @param partyDefId The party, or 0
   * @returns The packet
   */
  public static of(
    roomId: number,
    room: {
      readonly name: string
      readonly enviroType: number
      readonly defId: number
    },
    partyDefId = 0,
  ): RoomPropertiesOutgoing {
    return PacketFactory.create<RoomPropertiesOutgoing>(
      RoomPropertiesOutgoing,
      {
        room: roomId,
        pathName: room.name,
        environmentType: room.enviroType,
        roomType: partyDefId > 0 ? PARTY_ROOM_TYPE : 0,
        secondaryDefId: partyDefId,
        zoom: 100,
        roomDefId: room.defId,
        customData: '',
      },
    )
  }

  /**
   * Says what den to load
   * @param roomId The instance's id
   * @param den The den
   * @returns The packet
   */
  public static den(roomId: number, den: LoadedDen): RoomPropertiesOutgoing {
    return PacketFactory.create<RoomPropertiesOutgoing>(
      RoomPropertiesOutgoing,
      {
        room: roomId,
        pathName: den.pathName,
        environmentType: den.enviroType,
        roomType: DEN_ROOM_TYPE,
        secondaryDefId: den.denDefId,
        zoom: 100,
        roomDefId: den.roomDefId,
        customData: '',
      },
    )
  }
}
