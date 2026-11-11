import { createHash, randomBytes } from 'node:crypto'

import { type ClusterStore } from '#cluster/store'

/**
 * How long a ticket lasts
 */
export const TICKET_TTL = 5 * 60_000

/**
 * A ticket's details
 */
export type Ticket = {
  /**
   * The account playing
   */
  readonly accountId: string

  /**
   * The node they play on
   */
  readonly nodeId: number
}

/**
 * The game tickets
 * @class
 */
export class TicketStore {
  /**
   * The store
   */
  private readonly store: ClusterStore

  /**
   * Creates the ticket store
   * @param store The store
   */
  public constructor(store: ClusterStore) {
    this.store = store
  }

  /**
   * Issues a ticket
   * @param ticket What it is for
   * @returns The ticket token
   */
  public async issue(ticket: Ticket): Promise<string> {
    const token = randomBytes(32).toString('hex')

    await this.store.put(
      TicketStore.key(token),
      JSON.stringify(ticket),
      TICKET_TTL,
    )

    return token
  }

  /**
   * Moves a ticket to another node
   * @param token The ticket token
   * @param ticket What it is for
   */
  public async transfer(token: string, ticket: Ticket): Promise<void> {
    await this.store.put(
      TicketStore.key(token),
      JSON.stringify(ticket),
      TICKET_TTL,
    )
  }

  /**
   * Peeks at a ticket
   * @param token The ticket token
   * @returns What it is for, or null
   */
  public async peek(token: string): Promise<Ticket | null> {
    if (token === '') return null

    const stored = await this.store.get(TicketStore.key(token))

    return stored === null ? null : (JSON.parse(stored) as Ticket)
  }

  /**
   * Uses a ticket up
   * @param token The ticket token
   * @param nodeId The node
   * @returns The account id, or null
   */
  public async redeem(token: string, nodeId: number): Promise<string | null> {
    if (token === '') return null

    const stored = await this.store.take(TicketStore.key(token))
    if (stored === null) return null

    const ticket = JSON.parse(stored) as Ticket

    return ticket.nodeId === nodeId ? ticket.accountId : null
  }

  /**
   * A ticket's key
   * @param token The ticket token
   * @returns The key
   */
  private static key(token: string): string {
    return `peck:ticket:${createHash('sha256').update(token).digest('hex')}`
  }
}
