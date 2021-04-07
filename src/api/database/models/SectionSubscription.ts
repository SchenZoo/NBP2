import mongoose, { Document, Schema, model } from "mongoose";
import { ModelName } from "../../../constants/ModelName";
import { IUser } from "./User";
import { ISection } from "./Section";

export interface ISectionSubscription extends Document {
  section?: ISection;
  user?: IUser;
  userId: string;
  sectionId: string;
}

const sectionSubscriptionSchema = new Schema(
  {
    sectionId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

sectionSubscriptionSchema.virtual("user", {
  ref: ModelName.USER,
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

sectionSubscriptionSchema.virtual("section", {
  ref: ModelName.SECTION,
  localField: "sectionId",
  foreignField: "_id",
  justOne: true,
});

export const SectionSubscriptionModel = model<ISectionSubscription>(
  ModelName.SECTION_SUBSCRIPTION,
  sectionSubscriptionSchema
);
