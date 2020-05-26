import { ChatSessionService } from "./../services/SessionService";
import {
  ChatSessionModel,
  IChatSession,
  ChatSessionTypes,
} from "./../database/models/ChatSession";
import { ConflictError } from "./../errors/ConflictError";
import { GroupParticipantObjectValidator } from "./../validators/GroupParticipantValidator";
import { GROUP_PARTICIPANT_TYPES } from "./../../constants/models/group/GroupParticipantTypes";
import { GroupObjectValidator } from "./../validators/GroupValidator";
import { GroupPolicy, IGroupPolicyRequest } from "./../policy/GroupPolicy";
import { BASE_POLICY_NAMES } from "./../policy/BasePolicy";
import { RoleNames } from "./../../constants/RoleNames";
import {
  checkRole,
  policyCheck,
} from "./../middlewares/AuthorizationMiddlewares";
import {
  JsonController,
  UseBefore,
  Get,
  QueryParams,
  CurrentUser,
  Put,
  Req,
  Body,
  Param,
  Post,
  Delete,
} from "routing-controllers";
import { passportJwtMiddleware } from "../middlewares/PassportJwtMiddleware";
import { Pagination } from "../misc/QueryPagination";
import { IUser } from "../database/models/User";
import { GroupModel } from "../database/models";

@JsonController("/groups")
@UseBefore(passportJwtMiddleware)
export class GroupController {
  constructor(private sessionService: ChatSessionService) {}

  @Get()
  public async get(
    @QueryParams() query: Pagination,
    @CurrentUser() user: IUser
  ) {
    const mongoQuery = {};
    if (!user.hasRoles([RoleNames.ADMIN])) {
      mongoQuery["participants.participantId"] = user._id;
    }
    return GroupModel.find(mongoQuery)
      .sort({ createdAt: -1 })
      .populate("participants.participant")
      .paginate(query.skip, query.take)
      .cache();
  }

  @Get("/:id")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.GET, GroupPolicy))
  @UseBefore(checkRole([RoleNames.ADMIN, RoleNames.PROFESSOR]))
  public async getById(@Req() req: IGroupPolicyRequest) {
    const group = req.requestGroup;
    await group.populate("participants.participant").execPopulate();
    return group;
  }

  @Post("/")
  @UseBefore(checkRole([RoleNames.ADMIN, RoleNames.PROFESSOR]))
  public async create(
    @Body() body: GroupObjectValidator,
    @CurrentUser() user: IUser
  ) {
    const allParticipants = [
      { type: GROUP_PARTICIPANT_TYPES.OWNER, participantId: user._id },
    ];
    if (body.participantIds) {
      allParticipants.push(
        ...body.participantIds.map((id) => ({
          type: GROUP_PARTICIPANT_TYPES.USER,
          participantId: id,
        }))
      );
    }
    const chatSession = await new ChatSessionModel({
      name: body.name,
      type: ChatSessionTypes.GROUP,
      participantIds: allParticipants.map((par) => par.participantId),
    }).save();
    const group = await new GroupModel({
      ...body,
      userId: user._id,
      participants: allParticipants,
      chatSessionId: chatSession._id,
    }).save();
    return group.populate("participants.participant").execPopulate();
  }

  @Put("/:id")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, GroupPolicy))
  @UseBefore(checkRole([RoleNames.ADMIN, RoleNames.PROFESSOR]))
  public async update(
    @Body() body: GroupObjectValidator,
    @Param("id") id: string
  ) {
    return GroupModel.findByIdAndUpdate(id, body, { new: true });
  }

  @Delete("/:id")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.DELETE, GroupPolicy))
  @UseBefore(checkRole([RoleNames.ADMIN, RoleNames.PROFESSOR]))
  public async delete(@Req() req: IGroupPolicyRequest) {
    const group = req.requestGroup;
    await Promise.all([
      group.remove(),
      ChatSessionModel.deleteOne({ _id: group.chatSessionId }),
    ]);
    return { message: "Deleted" };
  }

  @Post("/:id/participants")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, GroupPolicy))
  @UseBefore(checkRole([RoleNames.ADMIN, RoleNames.PROFESSOR]))
  public async addParticipant(
    @Body() body: GroupParticipantObjectValidator,
    @Req() req: IGroupPolicyRequest
  ) {
    const group = req.requestGroup;
    if (
      group.participants.some((participant) =>
        body.participantIds.some(
          (participantId) =>
            `${participantId}` === `${participant.participantId}`
        )
      )
    ) {
      throw new ConflictError("Participant is already part of the group");
    }
    const newParticipants = body.participantIds.map((participantId) => ({
      participantId,
      type: GROUP_PARTICIPANT_TYPES.USER,
    }));
    const [updatedGroup] = await Promise.all([
      GroupModel.findByIdAndUpdate(
        group._id,
        { $push: { participants: { $each: newParticipants } } },
        { new: true }
      ).populate("participants.participant"),
      this.sessionService.addMultiParticipants(
        group.chatSessionId,
        body.participantIds
      ),
    ]);
    return updatedGroup;
  }

  @Delete("/:id/participants/:participantId")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, GroupPolicy))
  @UseBefore(checkRole([RoleNames.ADMIN, RoleNames.PROFESSOR]))
  public async removeParticipant(
    @Req() req: IGroupPolicyRequest,
    @Param("participantId") participantId: string
  ) {
    const group = req.requestGroup;
    const [updatedGroup] = await Promise.all([
      GroupModel.findByIdAndUpdate(
        group._id,
        { $pull: { participants: { participantId } } },
        { new: true }
      ),
      this.sessionService.removeParticipant(group.chatSessionId, participantId),
    ]);
    return updatedGroup;
  }
}
