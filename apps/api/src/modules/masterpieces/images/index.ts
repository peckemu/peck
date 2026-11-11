/**
 * The most a picture may be
 */
export const MOST_BYTES = 1024 * 1024

/**
 * The largest picture size
 */
const MOST_SIDE = 2048

/**
 * The smallest picture size
 */
const LEAST_SIDE = 16

/**
 * What a PNG starts with
 */
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

/**
 * A picture's type and size
 */
export type PictureInfo = {
  /**
   * Its type
   */
  readonly type: 'image/png' | 'image/jpeg'

  /**
   * Its width
   */
  readonly width: number

  /**
   * Its height
   */
  readonly height: number
}

/**
 * Checks pictures from the art studio
 * @class
 */
export class Pictures {
  /**
   * Reads a picture's type and size
   * @param bytes The picture
   * @returns Its details, or null
   */
  public static read(bytes: Uint8Array): PictureInfo | null {
    if (bytes.length === 0 || bytes.length > MOST_BYTES) return null

    const info = Pictures.png(bytes) ?? Pictures.jpeg(bytes)
    if (!info) return null

    const { width, height } = info
    const sane = (side: number): boolean =>
      side >= LEAST_SIDE && side <= MOST_SIDE

    return sane(width) && sane(height) ? info : null
  }

  /**
   * Reads a PNG's size
   * @param bytes The picture
   * @returns Its details, or null
   */
  private static png(bytes: Uint8Array): PictureInfo | null {
    if (bytes.length < 24 || PNG.some((byte, index) => bytes[index] !== byte)) {
      return null
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

    return {
      type: 'image/png',
      width: view.getUint32(16),
      height: view.getUint32(20),
    }
  }

  /**
   * Reads a JPEG's size
   * @param bytes The picture
   * @returns Its details, or null
   */
  private static jpeg(bytes: Uint8Array): PictureInfo | null {
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    let at = 2

    while (at + 9 < bytes.length) {
      if (bytes[at] !== 0xff) return null

      const marker = bytes[at + 1] ?? 0
      const length = view.getUint16(at + 2)
      const frame =
        marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)

      if (frame) {
        return {
          type: 'image/jpeg',
          width: view.getUint16(at + 7),
          height: view.getUint16(at + 5),
        }
      }

      at += 2 + length
    }

    return null
  }
}
