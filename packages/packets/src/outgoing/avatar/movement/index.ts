import { type Point } from '@peck/shared'

import { Field, OutgoingPacket, Packet } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * One avatar in a movement update
 */
export type MovedAvatar = {
  /**
   * The avatar's SmartFox user id
   */
  readonly userId: number

  /**
   * The points the avatar walks through
   */
  readonly path: readonly Point[]

  /**
   * Whether the avatar is placed
   */
  readonly teleport: boolean
}

/**
 * Avatars in the room moved
 * @class
 */
@Packet(Outgoing.Movement, 'xt')
export class MovementOutgoing extends OutgoingPacket {
  /**
   * The moved avatars
   */
  @Field.list(
    Field.object({
      userId: Field.int(),
      path: Field.list(Field.object({ x: Field.int(), y: Field.int() })),
      teleport: Field.bool(),
    }),
  )
  public readonly avatars: readonly MovedAvatar[] = []
}
