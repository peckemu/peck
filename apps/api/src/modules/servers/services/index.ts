import { inject, injectable } from '@needle-di/core'
import { type NodeInfo, NodeRegistry, type NodeRoom } from '@peck/cluster'
import { AuditRepository } from '@peck/database'

import { ServiceError } from '#api/errors'

/**
 * Lists and drains the emulator nodes
 * @class
 */
@injectable()
export class ServerService {
  /**
   * Every emulator node
   */
  private readonly nodes = inject<NodeRegistry>(NodeRegistry)

  /**
   * The audit log
   */
  private readonly audit = inject<AuditRepository>(AuditRepository)

  /**
   * Lists the live nodes
   * @returns The nodes
   */
  public async list(): Promise<NodeInfo[]> {
    return this.nodes.list()
  }

  /**
   * Lists the rooms open on a node
   * @param id The node id
   * @returns The rooms
   */
  public async rooms(id: number): Promise<NodeRoom[]> {
    await this.found(id)

    return this.nodes.rooms(id)
  }

  /**
   * Drains or undrains a node
   * @param actorId Who is changing it
   * @param id The node id
   * @param draining Whether it takes nobody new
   */
  public async drain(
    actorId: string,
    id: number,
    draining: boolean,
  ): Promise<void> {
    const node = await this.found(id)

    await this.nodes.drain(id, draining)

    await this.audit.record({
      actorId,
      action: draining ? 'server.drained' : 'server.reopened',
      targetKind: 'server',
      targetId: String(id),
      targetName: node.name,
    })
  }

  /**
   * Finds a live node
   * @param id The node id
   * @returns The node
   */
  private async found(id: number): Promise<NodeInfo> {
    const node = await this.nodes.get(id)
    if (!node) throw new ServiceError('Server not found', 'NOT_FOUND')

    return node
  }
}
