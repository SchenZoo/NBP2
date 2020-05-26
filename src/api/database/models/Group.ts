import { CACHE_KEYS } from "./../../../constants/CacheKeys";
import { GROUP_PARTICIPANT_TYPES } from "./../../../constants/models/group/GroupParticipantTypes";
import { IUser } from "./User";
import mongoose, { Document, Schema } from "mongoose";
import { ModelName } from "../../../constants/ModelName";
import { initializeCacheClear } from "../../misc/MongoModelCacheClear";

export interface IGroup extends Document {
  name: string;
  participants: Array<{
    type: string;
    participantId: string;
    participant?: IUser;
  }>;
  user?: IUser;
  userId: string;
  chatSessionId: string;
}

const groupParticipantSchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(GROUP_PARTICIPANT_TYPES),
      required: true,
    },
    participantId: {
      type: Schema.Types.ObjectId,
      ref: ModelName.USER,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
    id: false,
    _id: false,
  }
);

groupParticipantSchema.virtual("participant", {
  ref: ModelName.USER,
  localField: "participantId",
  foreignField: "_id",
  justOne: true,
});

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    participants: {
      type: [groupParticipantSchema],
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: ModelName.USER },
    chatSessionId: {
      type: Schema.Types.ObjectId,
      ref: ModelName.CHAT_SESSION,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

groupSchema.virtual("user", {
  ref: ModelName.USER,
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

initializeCacheClear(groupSchema, ModelName.GROUP, CACHE_KEYS.ITEM_GROUP);

export const GroupModel = mongoose.model<IGroup>(ModelName.GROUP, groupSchema);
