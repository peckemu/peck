import { inject } from '@needle-di/core'
import { TicketStore } from '@peck/cluster'
import {
  nodeOfShard,
  RoomManager,
  type RoomPlacement,
  shardOfRoom,
} from '@peck/game'
import {
  RoomJoinError,
  RoomJoinIncoming,
  RoomJoinOutgoing,
  RoomPropertiesOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'
import { RoomJoinType } from '@peck/shared'

import { ClusterNode } from '#emulator/cluster/node'
import { type Config } from '#emulator/config'
import { type HandlerContext } from '#emulator/dispatch/context'
import { MinigameTables } from '#emulator/handlers/minigame/tables'
import { PartyVenues } from '#emulator/handlers/party/venue'
import { SessionManager } from '#emulator/sessions/manager'
import { ConfigToken } from '#emulator/tokens'

/**
 * Puts the player in a room
 * @class
 */
@Handler(RoomJoinIncoming)
export class RoomJoinHandler extends PacketHandler<RoomJoinIncoming> {
  /**
   * The emulator config
   */
  private readonly config = inject<Config>(ConfigToken)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Tracks party rooms
   */
  private readonly venues = inject<PartyVenues>(PartyVenues)

  /**
   * Seats players at games
   */
  private readonly tables = inject<MinigameTables>(MinigameTables)

  /**
   * This node in the cluster
   */
  private readonly node = inject<ClusterNode>(ClusterNode)

  /**
   * The game tickets
   */
  private readonly tickets = inject<TicketStore>(TicketStore)

  /**
   * Joins a room
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: RoomJoinIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const { avatar } = player
    if (!avatar) return

    const host = await this.elsewhere(context, packet.target)
    if (host !== null) {
      return session.send<RoomJoinOutgoing>(
        RoomJoinOutgoing.refused(packet.room, RoomJoinError.OtherNode, host),
      )
    }

    const from = player.roomId
    await this.tables.arrive(session)

    const placement = this.place(context, packet)
    if (!placement.room) {
      const error =
        placement.reason === 'full'
          ? RoomJoinError.Full
          : RoomJoinError.NoSuchRoom
      return session.send<RoomJoinOutgoing>(
        RoomJoinOutgoing.refused(packet.room, error),
      )
    }

    const { room } = placement
    await this.sessions.arrive(session, from)

    await session.send<RoomJoinOutgoing>(
      RoomJoinOutgoing.joinedRoom({
        name: room.name,
        id: room.id,
        users: room.size,
        capacity: room.capacity,
        displayName: room.template.sentName,
        displayNameId: room.template.nameId,
        perUserAvId: avatar.perUserId,
        activePetInvId:
          player.petOut(room.template.enviroType === 1)?.invId ?? 0,
        song: room.template.party?.song ?? 0,
        shard: shardOfRoom(room.name),
      }),
    )

    await session.send<RoomPropertiesOutgoing>(
      RoomPropertiesOutgoing.of(
        room.id,
        room.template,
        this.venues.partyAt(room.template),
      ),
    )
    await this.sessions.introduce(session)
  }

  /**
   * Sends the player to the node with their shard
   * @param context The packet context
   * @param target The room name
   * @returns The node's host, or null
   */
  private async elsewhere(
    context: HandlerContext,
    target: string,
  ): Promise<string | null> {
    const { player, session } = context

    const shard = shardOfRoom(target)
    const nodeId = shard === null ? null : nodeOfShard(shard)
    if (shard === null || nodeId === null || this.rooms.owns(shard)) {
      return null
    }

    const node = await this.node.other(nodeId)
    if (!node || session.ticket === null || player.accountId === '') {
      return null
    }

    await this.tickets.transfer(session.ticket, {
      accountId: player.accountId,
      nodeId: node.id,
    })

    return node.host
  }

  /**
   * Places the player in a room
   * @param context The packet context
   * @param packet The packet
   * @returns Where the player went
   */
  private place(
    context: HandlerContext,
    packet: RoomJoinIncoming,
  ): RoomPlacement {
    const { player } = context
    const joinType = joinTypeOf(packet.joinType)

    const placement = this.rooms.join(player, packet.target, joinType)
    if (placement.room || placement.reason === 'full' || player.room) {
      return placement
    }

    return this.rooms.join(player, this.config.startRoom, RoomJoinType.Auto)
  }
}

/**
 * Reads the join type
 * @param joinType The join type
 * @returns The join type
 */
const joinTypeOf = (joinType: number): RoomJoinType =>
  joinType === RoomJoinType.DirectHalt || joinType === RoomJoinType.DirectSearch
    ? joinType
    : RoomJoinType.Auto
