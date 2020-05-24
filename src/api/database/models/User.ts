import { CACHE_KEYS } from "./../../../constants/CacheKeys";
import mongoose, { Schema, Document } from "mongoose";
import { compareSync } from "bcrypt";
import { ModelName } from "../../../constants/ModelName";
import { getModelImageUrl } from "../../../constants/ModelImagePath";
import { initializeCacheClear } from "../../misc/MongoModelCacheClear";

export interface IUser extends Document {
  username: string;
  name: string;
  password: string;
  email: string;
  roles: string[];
  imageURL: string;
  hasRoles(role: string[]): boolean;
  checkPassword(password: string): boolean;
}

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      required: true,
      type: String,
      select: false,
    },
    email: {
      type: String,
    },
    name: String,
    roles: [String],
    imageURL: {
      type: String,
      get: (imageName) => getModelImageUrl(imageName),
    },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);
userSchema.methods.checkPassword = function (password: string): boolean {
  return compareSync(password, this.password);
};
userSchema.methods.hasRoles = function (roles: string[]): boolean {
  return roles.some((role) => this.roles.includes(role));
};

initializeCacheClear(userSchema, ModelName.USER, CACHE_KEYS.ITEM_USER);

export const UserModel = mongoose.model<IUser>(ModelName.USER, userSchema);
