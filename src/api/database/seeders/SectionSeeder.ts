import { ISeeder } from './Seeder'
import { SectionModel } from '../models/Section'
import { UserModel } from '../models/User'
import faker = require('faker')

export class SectionSeeder implements ISeeder {
  public log: boolean
  constructor(log: boolean = false) {
    this.log = log
  }
  public async seed(count: number) {
    const admin = await UserModel.findOne({ username: 'Admin' })
    if (!admin) {
      console.error('ADMIN ISNT FOUND!')
      return false
    }
    const promises: Array<Promise<any>> = []
    try {
      for (let i = 0; i < count; i++) {
        const section = new SectionModel({
          user: admin.id,
          name: faker.name.title(),
          imageURL: faker.image.imageUrl(),
          onServer: false,
        })
        promises.push(section.save())
        if (this.log) {
          console.log('Created - name:' + section.name)
        }
      }
    } catch (err) {
      if (this.log) {
        console.error(err)
      }
    }
    await Promise.all(promises)
    return true
  }
}

setTimeout(() => {
  new SectionSeeder(true).seed(20).then(res => {
    process.exit(0)
  })
}, 2000)
