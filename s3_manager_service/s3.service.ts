import {
  DeleteObjectCommand,
  GetObjectAclCommand,
  GetObjectAclCommandOutput,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { genRandString } from './utils'

@Injectable()
export class S3Manager {
  private s3: S3Client
  private bucket: string
  private region: string

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('s3BucketName')
    this.region = 'ru-central1'

    this.s3 = new S3Client({
      region: this.region,
      endpoint: 'https://storage.yandexcloud.net',
      credentials: {
        accessKeyId: this.configService.get<string>('s3PublicAccess'),
        secretAccessKey: this.configService.get<string>('s3PrivateAccess')
      }
    })
  }

  async uploadOne(buffer: Buffer, path: string): Promise<void> {
    let filename = ''
    do {
      filename = genRandString(12)
    } while (await this._isKeyExists(path + filename))

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: path + filename,
      Body: buffer
    })
    const data = await this.s3.send(command)
    console.log(data)
  }

  async uploadMany(files: Buffer[], path: string): Promise<void> {
    const uploadPromises = files.map(async (file) => {
      await this.uploadOne(file, path)
    })
    await Promise.all(uploadPromises)
  }

  async getOne(key: string): Promise<GetObjectAclCommandOutput> {
    const command = new GetObjectAclCommand({
      Bucket: this.bucket,
      Key: key
    })
    const data = await this.s3.send(command)
    return data
  }

  async getMany(keys: string[]): Promise<GetObjectAclCommandOutput[]> {
    const uploadPromises = keys.map(async (key) => {
      const data = await this.getOne(key)
      return data
    })
    return await Promise.all(uploadPromises)
  }

  async deleteOne(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      })
      await this.s3.send(command)
    } catch (error) {
      throw error
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    const uploadPromises = keys.map(async (key) => {
      await this.deleteOne(key)
    })
    await Promise.all(uploadPromises)
  }

  private async _isKeyExists(key: string): Promise<boolean> {
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }))
      return true
    } catch (error) {
      if (error.name === 'NotFound') {
        return false
      } else {
        throw error
      }
    }
  }
}
