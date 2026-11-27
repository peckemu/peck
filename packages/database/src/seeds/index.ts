import { type Seed } from '../seeder/index.ts'
import { AccountsSeed } from './accounts/index.ts'
import { AchievementsSeed } from './achievements/index.ts'
import { AvatarsSeed } from './avatars/index.ts'
import { DenItemsSeed } from './den-items/index.ts'
import { DenRoomsSeed } from './den-rooms/index.ts'
import { DiamondsSeed } from './diamonds/index.ts'
import { ExchangesSeed } from './exchanges/index.ts'
import { ItemsSeed } from './items/index.ts'
import { ListsSeed } from './lists/index.ts'
import { MinigamesSeed } from './minigames/index.ts'
import { PartiesSeed } from './parties/index.ts'
import { PermissionsSeed } from './permissions/index.ts'
import { ListContentsSeed } from './list-content/index.ts'
import { PetsSeed } from './pets/index.ts'
import { RolesSeed } from './roles/index.ts'
import { RoomsSeed } from './rooms/index.ts'
import { ScheduleSeed } from './schedule/index.ts'
import { WorldItemsSeed } from './world/index.ts'

export { ACCOUNTS } from './accounts/index.ts'

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
  new WorldItemsSeed(),
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
