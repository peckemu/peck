/**
 * A room's name
 */
export type RoomName = {
  /**
   * The room's name in English
   */
  readonly name: string

  /**
   * The name string id
   */
  readonly id: number

  /**
   * The join name
   */
  readonly sent?: string
}

/**
 * Known room names
 */
export const ROOM_NAMES: ReadonlyMap<string, RoomName> = new Map([
  ['jamaa_township.room_main', { name: 'Jamaa Township', id: 18234 }],
  ['sarepia.room_main', { name: 'Sarepia Forest', id: 18244 }],
  ['crystal_sands.room_main', { name: 'Crystal Sands', id: 18231 }],
  ['coral_canyons.room_main', { name: 'Coral Canyons', id: 18230 }],
  ['appondale.room_main', { name: 'Appondale', id: 18255 }],
  ['lost_temple_of_zios.room_main', { name: 'Lost Temple of Zios', id: 18236 }],
  ['aussie.room_main', { name: 'Kimbara Outback', id: 18287 }],
  ['mountains_of_shivveer.room_main', { name: 'Mt. Shiveer', id: 18257 }],
  ['balloosh.room_main', { name: 'Balloosh', id: 18253 }],
  ['oceans.bahari_bay', { name: 'Bahari Bay', id: 18270 }],
  ['oceans.crystal_reef', { name: 'Crystal Reef', id: 18271 }],
  ['oceans.deep_sea', { name: 'Deep Blue', id: 18272 }],
  ['appondale.pet_shop', { name: "Claws 'N Paws", id: 18374 }],
  ['jamaa_township.room_arcade', { name: 'Sol Arcade', id: 18281 }],
  ['lost_temple_of_zios.brady_barr', { name: "Brady's Lab", id: 18380 }],
  ['aussie.room_hos', { name: 'Medical Center', id: 26861 }],
  ['crystal_sands.room_tierney', { name: "Tierney's Aquarium", id: 18377 }],
  ['jamaa_township.room_diamonds', { name: 'Diamond Shop', id: 18327 }],
  ['jamaa_township.clothes_shop', { name: 'Jam Mart Clothing', id: 18232 }],
  [
    'jamaa_township.room_alphahq',
    { name: 'Alpha Headquarters', id: 31445, sent: '' },
  ],
])

/**
 * Gets a room's area name
 * @param name The room's name
 * @returns The area's name
 */
export const areaName = (name: string): string =>
  (name.split('.')[0] ?? name)
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
