import {
  FriendRequestModel,
  IFriendRequest,
} from "./../database/models/FriendRequest";
import { BasePolicy } from "./BasePolicy";
import { ObjectFromParamNotFound } from "../errors/ObjectFromParamNotFound";
import { RoleNames } from "../../constants/RoleNames";
import { Request } from "express";

export class FriendRequestPolicy extends BasePolicy {
  public async default(): Promise<boolean> {
    const { id } = this.request.params;
    const friendshipRequest = await FriendRequestModel.findById(id);
    if (!friendshipRequest) {
      throw new ObjectFromParamNotFound("Friendship", id);
    }
    (this
      .request as IFriendRequestPolicyRequest).requestFriendRequest = friendshipRequest;
    return (
      `${friendshipRequest.receiverId}` === `${this.user.id}` ||
      `${friendshipRequest.senderId}` === `${this.user.id}` ||
      this.user.hasRoles([RoleNames.ADMIN])
    );
  }

  public async accept() {
    const defaultAuth = await this.default();
    return (
      defaultAuth &&
      `${
        (this.request as IFriendRequestPolicyRequest).requestFriendRequest
          .receiverId
      }` === `${this.user.id}`
    );
  }
}

export interface IFriendRequestPolicyRequest extends Request {
  requestFriendRequest: IFriendRequest;
}

export enum FRIEND_REQUEST_POLICIES {
  ACCEPT = "accept",
}
