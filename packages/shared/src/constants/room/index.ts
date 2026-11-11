/**
 * Room join types
 */
export const RoomJoinType = {
  /**
   * Any instance with space
   */
  Auto: 0,
  /**
   * The asked instance, or none
   */
  DirectHalt: 1,
  /**
   * The asked instance, or any
   */
  DirectSearch: 2,
} as const

export type RoomJoinType = (typeof RoomJoinType)[keyof typeof RoomJoinType]
