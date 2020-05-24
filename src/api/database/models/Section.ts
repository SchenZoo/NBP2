import { CACHE_KEYS } from "./../../../constants/CacheKeys";
import mongoose, { Document, Schema } from "mongoose";
import { ModelName } from "../../../constants/ModelName";
import { IUser } from "./User";
import { getModelImageUrl } from "../../../constants/ModelImagePath";
import { initializeCacheClear } from "../../misc/MongoModelCacheClear";

export interface ISection extends Document {
  name: string;
  user: IUser | string;
  imageURL: string;
  onServer?: boolean;
}

const sectionSchema = new Schema(
  {
    name: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: ModelName.USER },
    imageURL: {
      type: String,
      required: true,
      get(url: string) {
        if (!url) {
          return null;
        }
        if ((this as any).onServer) {
          return getModelImageUrl(url);
        }
        return url;
      },
    },
    onServer: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

initializeCacheClear(sectionSchema, ModelName.SECTION, CACHE_KEYS.ITEM_SECTION);

export const SectionModel = mongoose.model<ISection>(
  ModelName.SECTION,
  sectionSchema
);
