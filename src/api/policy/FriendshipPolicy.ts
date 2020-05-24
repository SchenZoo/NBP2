import { FriendshipModel, IFriendship } from "./../database/models/Friendship";
import { BasePolicy } from "./BasePolicy";
import { ObjectFromParamNotFound } from "../errors/ObjectFromParamNotFound";
import { RoleNames } from "../../constants/RoleNames";
import { Request } from "express";

export class FriendshipPolicy extends BasePolicy {
  public async default(): Promise<boolean> {
    const { id } = this.request.params;
    const friendship = await FriendshipModel.findById(id);
    if (!friendship) {
      throw new ObjectFromParamNotFound("Friendship", id);
    }
    (this.request as IFriendshipPolicyRequest).requestFriendship = friendship;
    return (
      `${friendship.marioId}` === `${this.user.id}` ||
      `${friendship.luigiId}` === `${this.user.id}` ||
      this.user.hasRoles([RoleNames.ADMIN])
    );
  }
}

export interface IFriendshipPolicyRequest extends Request {
  requestFriendship: IFriendship;
}
