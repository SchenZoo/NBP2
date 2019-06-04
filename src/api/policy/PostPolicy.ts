import { Request } from 'express'
import { BasePolicy } from './BasePolicy'
import { PostModel } from '../database/models/Post'
import { ObjectFromParamNotFound } from '../errors/ObjectFromParamNotFound'
import { RoleNames } from '../../constants/RoleNames'

export class PostPolicy extends BasePolicy {
  public async default(): Promise<boolean> {
    const post = await PostModel.findById(this.request.params.id)
    console.log(post)
    if (!post) {
      throw new ObjectFromParamNotFound('Post', this.request.params.id)
    }
    return post.creator === this.user.id || this.user.hasRoles([RoleNames.ADMIN])
  }
}