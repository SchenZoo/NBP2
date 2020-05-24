import { FriendRequestModel } from "./../database/models/FriendRequest";
import { FriendshipModel } from "./../database/models/Friendship";

import { Service } from "typedi";

@Service()
export class FriendRepository {
  public findFriendRequestBetweenUsers(userId1: string, userId2: string) {
    return FriendRequestModel.findOne({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    });
  }

  public findFriendshipBetweenUsers(userId1: string, userId2: string) {
    return FriendshipModel.findOne().or([
      { marioId: userId1, luigiId: userId2 },
      { marioId: userId2, luigiId: userId1 },
    ]);
  }
}
