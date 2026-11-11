import { ContentExport, type Row } from '#content/exports/export'
import { areaName, ROOM_NAMES } from '#content/names'
import { type PackSet } from '#content/pack'

/**
 * Exports the rooms pack
 * @class
 */
export class RoomsExport extends ContentExport {
  /**
   * The file name
   */
  public readonly file = 'rooms'

  /**
   * The pack ids it reads
   */
  public readonly packs = [1011]

  /**
   * Reads the rooms
   * @param packs The def packs
   * @returns The rooms
   */
  public rows(packs: PackSet): Row[] {
    const pack = packs.get(1011)

    return pack
      .definitions()
      .filter((definition) => definition.text('pathName') !== '')
      .map((definition) => {
        const name = RoomsExport.roomName(definition.text('pathName'))
        const known = ROOM_NAMES.get(name)
        return {
          defId: definition.int('id'),
          name,
          enviroType: definition.int('type'),
          platformer: definition.flag('isPlatformer'),
          displayName: known?.name ?? areaName(name),
          nameId: known?.id ?? 0,
          ...(known?.sent === undefined ? {} : { sentName: known.sent }),
        }
      })
  }

  /**
   * Gets a room's name
   * @param path The room's path
   * @returns The room's name
   */
  private static roomName(path: string): string {
    return path
      .trim()
      .replace(/\.xroom$/i, '')
      .replace(/\//g, '.')
      .toLowerCase()
  }
}
