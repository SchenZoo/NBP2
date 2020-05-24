import { CACHE_KEYS } from "./../constants/CacheKeys";
import { IMongooseQuery } from "./../api/app_models/mongoose/IMongooseQuery";
import { jwtStrategyOptions } from "../config/JwtStrategyOptions";
import { UserModel, IUser } from "../api/database/models/User";
import { UnauthorizedError } from "routing-controllers";
import { Strategy } from "passport-jwt";

export const JwtStrategy = new Strategy(
  jwtStrategyOptions,
  async (payload, next) => {
    try {
      const user = await (UserModel.findById(payload.id) as IMongooseQuery<
        IUser
      >).cache({ cacheKey: CACHE_KEYS.ITEM_USER(payload.id) });
      next(null, user);
    } catch (err) {
      throw new UnauthorizedError("Failed getting the user");
    }
  }
);
