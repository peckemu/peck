import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * Plays a film
 * @class
 */
@Packet(Outgoing.QuestFilm, 'xt')
export class QuestFilmOutgoing extends OutgoingPacket {
  /**
   * The film
   */
  @Field.int() public readonly mediaId: number = 0

  /**
   * Plays a film
   * @param room The target room
   * @param mediaId The film
   * @returns The packet
   */
  public static of(room: number, mediaId: number): QuestFilmOutgoing {
    return PacketFactory.create<QuestFilmOutgoing>(QuestFilmOutgoing, {
      room,
      mediaId,
    })
  }
}

/**
 * Loads a film
 * @class
 */
@Packet(Outgoing.QuestPreload, 'xt')
export class QuestPreloadOutgoing extends OutgoingPacket {
  /**
   * The film
   */
  @Field.int() public readonly mediaId: number = 0

  /**
   * Loads a film
   * @param room The target room
   * @param mediaId The film
   * @returns The packet
   */
  public static of(room: number, mediaId: number): QuestPreloadOutgoing {
    return PacketFactory.create<QuestPreloadOutgoing>(QuestPreloadOutgoing, {
      room,
      mediaId,
    })
  }
}

/**
 * Fades the screen
 * @class
 */
@Packet(Outgoing.QuestFade, 'xt')
export class QuestFadeOutgoing extends OutgoingPacket {
  /**
   * Whether it fades in
   */
  @Field.int() public readonly fadeIn: number = 0

  /**
   * Fades the screen
   * @param room The target room
   * @param fadeIn Whether it fades in
   * @returns The packet
   */
  public static of(room: number, fadeIn: boolean): QuestFadeOutgoing {
    return PacketFactory.create<QuestFadeOutgoing>(QuestFadeOutgoing, {
      room,
      fadeIn: fadeIn ? 1 : 0,
    })
  }
}

/**
 * Shakes the room
 * @class
 */
@Packet(Outgoing.QuestShake, 'xt')
export class QuestShakeOutgoing extends OutgoingPacket {
  /**
   * How long
   */
  @Field.number() public readonly milliseconds: number = 0

  /**
   * Shakes the room
   * @param room The target room
   * @param milliseconds How long
   * @returns The packet
   */
  public static of(room: number, milliseconds: number): QuestShakeOutgoing {
    return PacketFactory.create<QuestShakeOutgoing>(QuestShakeOutgoing, {
      room,
      milliseconds,
    })
  }
}

/**
 * Plays a sound
 * @class
 */
@Packet(Outgoing.QuestSound, 'xt')
export class QuestSoundOutgoing extends OutgoingPacket {
  /**
   * The sound
   */
  @Field.string() public readonly name: string = ''

  /**
   * Plays a sound
   * @param room The target room
   * @param name The sound
   * @returns The packet
   */
  public static of(room: number, name: string): QuestSoundOutgoing {
    return PacketFactory.create<QuestSoundOutgoing>(QuestSoundOutgoing, {
      room,
      name,
    })
  }
}

/**
 * Plays a voice over
 * @class
 */
@Packet(Outgoing.QuestVoiceOver, 'xt')
export class QuestVoiceOverOutgoing extends OutgoingPacket {
  /**
   * The voice over
   */
  @Field.string() public readonly name: string = ''

  /**
   * Its subtitle
   */
  @Field.string() public readonly subtitle: string = ''

  /**
   * Plays a voice over
   * @param room The target room
   * @param name The voice over
   * @param subtitle Its subtitle
   * @returns The packet
   */
  public static of(
    room: number,
    name: string,
    subtitle: string,
  ): QuestVoiceOverOutgoing {
    return PacketFactory.create<QuestVoiceOverOutgoing>(
      QuestVoiceOverOutgoing,
      {
        room,
        name,
        subtitle,
      },
    )
  }
}

/**
 * Changes the music
 * @class
 */
@Packet(Outgoing.QuestMusic, 'xt')
export class QuestMusicOutgoing extends OutgoingPacket {
  /**
   * The music, or 0
   */
  @Field.string() public readonly name: string = ''

  /**
   * Changes the music
   * @param room The target room
   * @param name The music, or 0
   * @returns The packet
   */
  public static of(room: number, name: string): QuestMusicOutgoing {
    return PacketFactory.create<QuestMusicOutgoing>(QuestMusicOutgoing, {
      room,
      name,
    })
  }
}

/**
 * Loads a sound pack
 * @class
 */
@Packet(Outgoing.QuestMediaLibrary, 'xt')
export class QuestMediaLibraryOutgoing extends OutgoingPacket {
  /**
   * The sound pack
   */
  @Field.int() public readonly mediaId: number = 0

  /**
   * Loads a sound pack
   * @param room The target room
   * @param mediaId The sound pack
   * @returns The packet
   */
  public static of(room: number, mediaId: number): QuestMediaLibraryOutgoing {
    return PacketFactory.create<QuestMediaLibraryOutgoing>(
      QuestMediaLibraryOutgoing,
      {
        room,
        mediaId,
      },
    )
  }
}

/**
 * Loads a sound pack
 * @class
 */
@Packet(Outgoing.QuestSoundPack, 'xt')
export class QuestSoundPackOutgoing extends OutgoingPacket {
  /**
   * The sound pack
   */
  @Field.int() public readonly mediaId: number = 0

  /**
   * Loads a sound pack
   * @param room The target room
   * @param mediaId The sound pack
   * @returns The packet
   */
  public static of(room: number, mediaId: number): QuestSoundPackOutgoing {
    return PacketFactory.create<QuestSoundPackOutgoing>(
      QuestSoundPackOutgoing,
      {
        room,
        mediaId,
      },
    )
  }
}

/**
 * Records a page view
 * @class
 */
@Packet(Outgoing.QuestPostUri, 'xt')
export class QuestPostUriOutgoing extends OutgoingPacket {
  /**
   * The page
   */
  @Field.string() public readonly uri: string = ''

  /**
   * Records a page view
   * @param room The target room
   * @param uri The page
   * @returns The packet
   */
  public static of(room: number, uri: string): QuestPostUriOutgoing {
    return PacketFactory.create<QuestPostUriOutgoing>(QuestPostUriOutgoing, {
      room,
      uri,
    })
  }
}
