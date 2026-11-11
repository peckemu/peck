import { type ShownPost, type ShownWall, type Wall } from '@peck/database'

/**
 * An outgoing post
 */
export type PostView = {
  /**
   * Its id
   */
  readonly x: string

  /**
   * What it says
   */
  readonly m: string

  /**
   * The poster's game id
   */
  readonly uid: number

  /**
   * The poster's username
   */
  readonly un: string

  /**
   * Whether the name is shown
   */
  readonly um: number

  /**
   * The poster's uuid
   */
  readonly u: string

  /**
   * The look behind the words
   */
  readonly s: number

  /**
   * The colour behind the words
   */
  readonly c: number

  /**
   * The time in milliseconds
   */
  readonly t: number

  /**
   * The poster's animal
   */
  readonly ai: number

  /**
   * Its colours
   */
  readonly ac: number[]

  /**
   * Its eyes
   */
  readonly ae: number

  /**
   * Its pattern
   */
  readonly ap: number

  /**
   * The poster's language
   */
  readonly l: number

  /**
   * Its custom animal
   */
  readonly aci: number

  /**
   * The parent post
   */
  readonly pp?: string
}

/**
 * An answer to the player's post
 */
export type NoticeView = Omit<PostView, 'uid' | 's'> & {
  /**
   * Whether it was seen
   */
  readonly read: boolean
}

/**
 * How a wall looks
 */
export type ParametersView = {
  /**
   * When its owner last read it
   */
  readonly rdt: number

  /**
   * Its background
   */
  readonly bg: number

  /**
   * How many have visited
   */
  readonly visits: number

  /**
   * Its stickers
   */
  readonly stk: { readonly id: number; readonly pos: number }[]

  /**
   * Its masterpieces
   */
  readonly mp: { readonly iid: number; readonly sid: number }[]

  /**
   * Its photo booth picture
   */
  readonly pb?: Record<string, unknown>

  /**
   * Its status line
   */
  readonly tag: string

  /**
   * The status line's language
   */
  readonly langId: number
}

/**
 * A wall view
 */
export type WallView = {
  /**
   * Whether it worked
   */
  readonly s: true

  /**
   * The posts
   */
  readonly r: PostView[]

  /**
   * Replies to the player's posts
   */
  readonly n: NoticeView[]

  /**
   * When it last changed
   */
  readonly t: number

  /**
   * How it looks
   */
  readonly p: ParametersView
}

/**
 * Shows a post
 * @param shown The post
 * @returns The view
 */
export const postView = (shown: ShownPost): PostView => {
  const { post } = shown

  return {
    x: post.id,
    m: post.message,
    uid: post.senderGameId,
    un: shown.senderName,
    um: 1,
    u: shown.senderUuid,
    s: post.patternId,
    c: post.colorId,
    t: post.postedAt.getTime(),
    ai: post.avatar.ai,
    ac: post.avatar.ac,
    ae: post.avatar.ae,
    ap: post.avatar.ap,
    l: post.localizationId,
    aci: post.avatar.aci,
    ...(post.parentId ? { pp: post.parentId } : {}),
  }
}

/**
 * Shows an answer to the player's post
 * @param shown The answer
 * @returns The view
 */
export const noticeView = (shown: ShownPost): NoticeView => {
  const { uid: _uid, s: _s, ...post } = postView(shown)

  return {
    ...post,
    un: shown.wall?.username ?? '',
    u: shown.wall?.uuid ?? '',
    read: shown.post.noticeRead,
  }
}

/**
 * Shows how a wall looks
 * @param wall The wall
 * @returns The view
 */
export const parametersView = (wall: Wall): ParametersView => ({
  rdt: wall.readAt.getTime(),
  bg: wall.background,
  visits: wall.visits,
  stk: wall.stickers,
  mp: wall.masterpieces,
  ...(wall.photo ? { pb: wall.photo } : {}),
  tag: wall.status,
  langId: wall.langId,
})

/**
 * Shows a wall
 * @param shown The wall
 * @returns The view
 */
export const wallView = (shown: ShownWall): WallView => ({
  s: true,
  r: shown.posts.map(postView),
  n: shown.notices.map(noticeView),
  t: shown.wall.changedAt.getTime(),
  p: parametersView(shown.wall),
})
