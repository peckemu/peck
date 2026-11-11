import { AchievementsExport } from '#content/exports/achievements'
import { AvatarsExport } from '#content/exports/avatars'
import { DenItemsExport } from '#content/exports/den-items'
import { DenRoomsExport } from '#content/exports/den-rooms'
import { DiamondsExport } from '#content/exports/diamonds'
import { ExchangesExport } from '#content/exports/exchanges'
import { type ContentExport } from '#content/exports/export'
import { ItemsExport } from '#content/exports/items'
import { ListsExport } from '#content/exports/lists'
import { PartiesExport } from '#content/exports/parties'
import { PetsExport } from '#content/exports/pets'
import { RoomsExport } from '#content/exports/rooms'

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
]

export { ContentExport, type Row } from '#content/exports/export'
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
}
