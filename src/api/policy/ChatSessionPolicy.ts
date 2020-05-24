import {
  ChatSessionModel,
  IChatSession,
} from "./../database/models/ChatSession";
import { Request } from "express";
import { BasePolicy } from "./BasePolicy";
import { ObjectFromParamNotFound } from "../errors/ObjectFromParamNotFound";
import { RoleNames } from "../../constants/RoleNames";

export class ChatSessionPolicy extends BasePolicy {
  public async default(): Promise<boolean> {
    const { id } = this.request.params;
    const session = await ChatSessionModel.findById(id);

    if (!session) {
      throw new ObjectFromParamNotFound("ChatSession", id);
    }
    (this.request as IChatSessionPolicyRequest).requestSession = session;
    return (
      session.participantIds.some(
        (participantId) => `${participantId}` === `${this.user.id}`
      ) || this.user.hasRoles([RoleNames.ADMIN])
    );
  }
}

export interface IChatSessionPolicyRequest extends Request {
  requestSession: IChatSession;
}
