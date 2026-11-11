import { type Seed } from '#database/seeder'
import { AccountsSeed } from '#database/seeds/accounts'
import { AchievementsSeed } from '#database/seeds/achievements'
import { AvatarsSeed } from '#database/seeds/avatars'
import { DenItemsSeed } from '#database/seeds/den-items'
import { DenRoomsSeed } from '#database/seeds/den-rooms'
import { DiamondsSeed } from '#database/seeds/diamonds'
import { ExchangesSeed } from '#database/seeds/exchanges'
import { ItemsSeed } from '#database/seeds/items'
import { ListsSeed } from '#database/seeds/lists'
import { MinigamesSeed } from '#database/seeds/minigames'
import { PartiesSeed } from '#database/seeds/parties'
import { PermissionsSeed } from '#database/seeds/permissions'
import { ListContentsSeed } from '#database/seeds/list-content'
import { PetsSeed } from '#database/seeds/pets'
import { RolesSeed } from '#database/seeds/roles'
import { RoomsSeed } from '#database/seeds/rooms'
import { ScheduleSeed } from '#database/seeds/schedule'

export { ACCOUNTS } from '#database/seeds/accounts'

/**
 * Every seed in order
 */
export const SEEDS: readonly Seed[] = [
  new RoomsSeed(),
  new ItemsSeed(),
  new AvatarsSeed(),
  new DenItemsSeed(),
  new DenRoomsSeed(),
  new PetsSeed(),
  new DiamondsSeed(),
  new ExchangesSeed(),
  new PartiesSeed(),
  new AchievementsSeed(),
  new ScheduleSeed(),
  new MinigamesSeed(),
  new ListContentsSeed(),
  new ListsSeed(),
  new PermissionsSeed(),
  new RolesSeed(),
  new AccountsSeed(),
]
