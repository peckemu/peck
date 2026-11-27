import { AchievementsExport } from './achievements/index.ts'
import { AvatarsExport } from './avatars/index.ts'
import { DenItemsExport } from './den-items/index.ts'
import { DenRoomsExport } from './den-rooms/index.ts'
import { DiamondsExport } from './diamonds/index.ts'
import { ExchangesExport } from './exchanges/index.ts'
import { type ContentExport } from './export/index.ts'
import { ItemsExport } from './items/index.ts'
import { ListsExport } from './lists/index.ts'
import { PartiesExport } from './parties/index.ts'
import { PetsExport } from './pets/index.ts'
import { RoomsExport } from './rooms/index.ts'
import { WorldItemsExport } from './world/index.ts'

/**
 * Every export
 */
export const EXPORTS: readonly ContentExport[] = [
  new RoomsExport(),
  new ItemsExport(),
  new AvatarsExport(),
  new DenItemsExport(),
  new DenRoomsExport(),
  new PetsExport(),
  new DiamondsExport(),
  new ExchangesExport(),
  new PartiesExport(),
  new AchievementsExport(),
  new ListsExport(),
  new WorldItemsExport(),
]

export { ContentExport, type Row } from './export/index.ts'
export {
  AchievementsExport,
  AvatarsExport,
  DenItemsExport,
  DenRoomsExport,
  DiamondsExport,
  ExchangesExport,
  ItemsExport,
  ListsExport,
  PartiesExport,
  PetsExport,
  RoomsExport,
  WorldItemsExport,
}
