import { CACHE_KEYS } from "./../../constants/CacheKeys";
import { Request } from "express";
import { UserModel, IUser } from "./../database/models/User";
import { BasePolicy } from "./BasePolicy";
import { ObjectFromParamNotFound } from "../errors/ObjectFromParamNotFound";
import { RoleNames } from "../../constants/RoleNames";

export class UserPolicy extends BasePolicy {
  public async default(): Promise<boolean> {
    const user = await UserModel.findById(this.request.params.id).cache({
      cacheKey: CACHE_KEYS.ITEM_USER(this.request.params.id),
    });
    if (!user) {
      throw new ObjectFromParamNotFound("User", this.request.params.id);
    }
    
    (this.request as IUserPolictyRequest).requestUser = user;

    return (
      `${user.id}` === `${this.user.id}` ||
      this.user.hasRoles([RoleNames.ADMIN])
    );
  }
}

export interface IUserPolictyRequest extends Request {
  requestUser: IUser;
}
