import { S3Client, type S3File } from 'bun'

import { inject, injectable } from '@needle-di/core'

import { type Config } from '#api/config'
import { ConfigToken } from '#api/tokens'

/**
 * Keeps masterpiece pictures in the bucket
 * @sxip if you don't know what this is for, it manages the storage of masterpiece pictures in the S3 bucket. you'll figure it out eventually
 * @class
 */
@injectable()
export class MasterpiecePictures {
  /**
   * The bucket
   */
  private readonly client: S3Client | null

  /**
   * Connects to the bucket
   */
  public constructor() {
    const { bucket } = inject<Config>(ConfigToken)

    this.client = bucket.name
      ? new S3Client({
          bucket: bucket.name,
          region: bucket.region,
          accessKeyId: bucket.accessKeyId,
          secretAccessKey: bucket.secretAccessKey,
          ...(bucket.endpoint ? { endpoint: bucket.endpoint } : {}),
        })
      : null
  }

  /**
   * Checks there is a bucket
   * @returns Whether there is
   */
  public get ready(): boolean {
    return this.client !== null
  }

  /**
   * Keeps a picture
   * @param uniqueImageId The masterpiece
   * @param bytes The picture
   * @param type Its type
   */
  public async put(
    uniqueImageId: string,
    bytes: Uint8Array,
    type: string,
  ): Promise<void> {
    if (!this.client) throw new Error('No bucket is set up')

    await this.client.write(MasterpiecePictures.key(uniqueImageId), bytes, {
      type,
    })
  }

  /**
   * Finds a picture
   * @param uniqueImageId The masterpiece
   * @returns The file, or null
   */
  public file(uniqueImageId: string): S3File | null {
    return this.client?.file(MasterpiecePictures.key(uniqueImageId)) ?? null
  }

  /**
   * Deletes pictures
   * @param uniqueImageIds The masterpieces
   */
  public async remove(uniqueImageIds: readonly string[]): Promise<void> {
    const client = this.client
    if (!client) return

    await Promise.all(
      uniqueImageIds.map((id) => client.delete(MasterpiecePictures.key(id))),
    )
  }

  /**
   * Finds a picture's path
   * @param uniqueImageId The masterpiece
   * @returns The key
   */
  private static key(uniqueImageId: string): string {
    return `masterpieces/${uniqueImageId}`
  }
}
