import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Finishes an adventure's film
 * @class
 */
@Packet(Incoming.QuestFilm, 'xt')
export class QuestFilmIncoming extends IncomingPacket {}
