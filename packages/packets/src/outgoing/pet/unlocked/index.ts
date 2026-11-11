import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The player's unlocked pets
 * @class
 */
@Packet(Outgoing.PetsUnlocked, 'xt')
export class PetsUnlockedOutgoing extends OutgoingPacket {
  /**
   * The unlocked kinds
   */
  @Field.string() public readonly unlockedPets: string = '0'

  /**
   * Lists the pets unlocked
   * @param room The target room
   * @param unlockedPets The unlocked pets
   * @returns The packet
   */
  public static of(room: number, unlockedPets: string): PetsUnlockedOutgoing {
    return PacketFactory.create<PetsUnlockedOutgoing>(PetsUnlockedOutgoing, {
      room,
      unlockedPets,
    })
  }
}
