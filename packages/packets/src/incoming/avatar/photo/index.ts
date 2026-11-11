import { IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Pays for a photo booth picture
 * @class
 */
@Packet(Incoming.AvatarPhoto, 'xt')
export class AvatarPhotoIncoming extends IncomingPacket {}

/**
 * Asks about a photo booth picture
 * @class
 */
@Packet(Incoming.AvatarPhotoCheck, 'xt')
export class AvatarPhotoCheckIncoming extends IncomingPacket {}
