import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A user variable
 */
export type UserVariable = {
  /**
   * The variable's id
   */
  readonly varId: number

  /**
   * The kind of value
   */
  readonly type: number

  /**
   * The value
   */
  readonly value: number
}

/**
 * The player's user variables
 * @class
 */
@Packet(Outgoing.UserVariables, 'xt')
export class UserVariablesOutgoing extends OutgoingPacket {
  /**
   * The variables
   */
  @Field.list(
    Field.object({
      varId: Field.int(),
      type: Field.int(),
      value: Field.number(),
    }),
  )
  public readonly userVars: readonly UserVariable[] = []

  /**
   * Lists the player's user variables
   * @param userVars The variables
   * @returns The packet
   */
  public static of(userVars: readonly UserVariable[]): UserVariablesOutgoing {
    return PacketFactory.create<UserVariablesOutgoing>(UserVariablesOutgoing, {
      room: -1,
      userVars,
    })
  }
}
