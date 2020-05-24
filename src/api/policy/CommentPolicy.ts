import { RoleNames } from "./../../constants/RoleNames";
import { CommentModel, IComment } from "./../database/models/Comment";
import { Request } from "express";
import { BasePolicy } from "./BasePolicy";
import { ObjectFromParamNotFound } from "../errors/ObjectFromParamNotFound";

export class CommentPolicy extends BasePolicy {
  public async default(): Promise<boolean> {
    const { id } = this.request.params;
    const comment = await CommentModel.findById(id);
    if (!comment) {
      throw new ObjectFromParamNotFound("Comment", id);
    }
    (this.request as ICommentPolicyRequest).requestComment = comment;
    return (
      `${comment.user}` === `${this.user.id}` ||
      this.user.hasRoles([RoleNames.ADMIN, RoleNames.PROFESSOR])
    );
  }
}

export interface ICommentPolicyRequest extends Request {
  requestComment: IComment;
}
