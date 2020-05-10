import { Request } from 'express'
import { IUser } from '../database/models/User'

export abstract class BasePolicy {
  protected request: Request
  protected user: IUser
  public constructor(request: Request) {
    this.request = request
    this.user = (request.user as IUser)
  }

  public abstract async default(): Promise<boolean | undefined>
  public get(): Promise<boolean | undefined> {
    return this.default()
  }
  public async update(): Promise<boolean | undefined> {
    return this.default()
  }
  public async delete(): Promise<boolean | undefined> {
    return this.default()
  }
}

export enum BASE_POLICY_NAMES {
  GET = 'get',
  UPDATE = 'update',
  DELETE = 'delete',
}
