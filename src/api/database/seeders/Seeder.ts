import '../MongoConnection'

export interface ISeeder {
  log: boolean
  seed(count?: number): Promise<any>
}
