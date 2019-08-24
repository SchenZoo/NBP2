import { Service } from 'typedi'
import { getExtension } from 'mime'
import { existsSync, mkdirSync, writeFile, unlink } from 'fs'
import path = require('path')
import md5 = require('md5')
import { getAbsoluteServerPath } from '../../constants/ModelImagePath'

@Service()
export class FileService {
  async addBase64Image(imageBase64: string, filePath: string): Promise<string> {
    const data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const name = md5(new Date().getTime().toString())
    const type = imageBase64.slice(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'))
    const extension = getExtension(type)
    const base64Data = Buffer.from(data, 'base64')
    const fullFilePath = getAbsoluteServerPath(filePath)
    if (!existsSync(fullFilePath)) {
      mkdirSync(fullFilePath, { recursive: true })
    }
    return new Promise((resolve, reject) => {
      writeFile(fullFilePath + '/' + name + '.' + extension, base64Data, { encoding: 'base64' }, err => {
        if (err) {
          reject(err)
        }
        resolve(filePath + '/' + name + '.' + extension)
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

  getAbsolutePath(relativePath: string): string {
    return path.resolve(relativePath)
  }
}
