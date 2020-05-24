import { CACHE_KEYS } from "./../../constants/CacheKeys";
import { IGroup } from "./../database/models/Group";
import { Request } from "express";
import { BasePolicy } from "./BasePolicy";
import { ObjectFromParamNotFound } from "../errors/ObjectFromParamNotFound";
import { RoleNames } from "../../constants/RoleNames";
import { GroupModel } from "../database/models";

export class GroupPolicy extends BasePolicy {
  public async default(): Promise<boolean> {
    const { id } = this.request.params;
    const group = await GroupModel.findById(id).cache({
      cacheKey: CACHE_KEYS.ITEM_GROUP(id),
    });
    if (!group) {
      throw new ObjectFromParamNotFound("Group", id);
    }
    (this.request as IGroupPolicyRequest).requestGroup = group;
    return (
      `${group.userId}` === `${this.user.id}` ||
      this.user.hasRoles([RoleNames.ADMIN])
    );
  }
}

export interface IGroupPolicyRequest extends Request {
  requestGroup: IGroup;
}
