import { UserModel, IUser } from '../models/User'
import { RoleNames } from '../../../constants/RoleNames'
import { hashPassowrd } from '../../misc/Hash'
import { ISeeder } from './Seeder'

export class AdminSeeder implements ISeeder {
  public log: boolean
  constructor(log: boolean = false) {
    this.log = log
  }
  public async seed() {
    const admin = new UserModel({
      username: 'Admin',
      name: 'Stane',
      password: hashPassowrd('asdlolasd'),
      roles: [RoleNames.ADMIN],
      email: 'stankovic.aleksandar@elfak.rs',
    } as IUser)
    try {
      await admin.save()
      if (this.log) {
        console.log('Admin created')
        return true
      }
    } catch (err) {
      if (this.log) {
        console.error(err)
        console.log('You have already created this user')
      }
    }
    return false
  }
}

new AdminSeeder(true).seed().then(res => {
  process.exit(0)
})
