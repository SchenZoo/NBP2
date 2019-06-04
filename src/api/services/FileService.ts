import { Service } from 'typedi'
import { getExtension } from 'mime'
import { hashSync } from 'bcrypt'
import { existsSync, mkdirSync, writeFile, unlink } from 'fs'
import path = require('path')

@Service()
export class FileService {
  IMAGE_PUBLIC_PATH = 'public/images/'

  async addBase64Image(imageBase64: string, filePath: string): Promise<string> {
    const data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const name = hashSync(new Date().getTime(), 12)
    const type = imageBase64.slice(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'))
    const extension = getExtension(type)
    const base64Data = Buffer.from(data, 'base64')
    const fullFilePath = path.resolve(this.IMAGE_PUBLIC_PATH + filePath)
    if (!existsSync(fullFilePath)) {
      mkdirSync(fullFilePath)
    }
    return new Promise((resolve, reject) => {
      writeFile(fullFilePath + name + '.' + extension, base64Data, { encoding: 'base64' }, err => {
        if (err) {
          reject(err)
        }
        resolve(filePath + name + '.' + extension)
      })
    })
  }

  async removeFile(fullFilePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      unlink(fullFilePath, err => {
        if (err) {
          reject(err)
        }
        resolve(true)
      })
    })
  }
}
