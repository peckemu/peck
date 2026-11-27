import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Finishes an adventure's film
 * @class
 */
@Packet(Incoming.QuestFilm, 'xt')
export class QuestFilmIncoming extends IncomingPacket {}
