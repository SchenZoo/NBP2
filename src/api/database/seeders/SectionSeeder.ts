import '../MongoConnection'
import { SectionModel } from '../models/Section'
import { UserModel } from '../models/User'
import faker = require('faker')

(async ()=>{
  const admin = await UserModel.findOne({ username: 'Admin' })
    if (!admin) {
      console.error('ADMIN ISNT FOUND!')
      process.exit(1)
    }
    const promises: Array<Promise<any>> = []
    try {
      for (let i = 0; i < 5; i++) {
        const section = new SectionModel({
          user: admin.id,
          name: faker.name.title(),
          imageURL: faker.image.imageUrl(),
          onServer: false,
        })
        promises.push(section.save())
          console.log('Created - name:' + section.name)
      }
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
    await Promise.all(promises)
    process.exit(0)
})()