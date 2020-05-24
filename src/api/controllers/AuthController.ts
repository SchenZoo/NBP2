import {
  JsonController,
  Post,
  Body,
  Req,
  Get,
  NotFoundError,
  BadRequestError,
} from "routing-controllers";
import { UserModel } from "../database/models/User";
import jwt = require("jsonwebtoken");
import { RoleNames } from "../../constants/RoleNames";
import { ConflictError } from "../errors/ConflictError";
import { hashPassowrd } from "../misc/Hash";
import { UserValidator } from "../validators/UserValidator";

const TOKEN_EXPIRY_TIME = "31d";

@JsonController("/auth")
export class AuthController {
  @Post("/login")
  public async get(@Body() user: UserValidator) {
    const foundUser = await UserModel.findOne({
      username: new RegExp(`^${user.username}$`, "i"),
    }).select("+password");
    if (foundUser) {
      if (foundUser.checkPassword(user.password)) {
        const payload = {
          id: foundUser.id,
        };
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secret as string, {
          expiresIn: TOKEN_EXPIRY_TIME,
        });
        delete foundUser.password;
        return { token, user: foundUser };
      }
    }
    throw new NotFoundError("User not found");
  }

  @Post("/register")
  public async save(@Body() userBody: UserValidator) {
    if (!userBody.password) {
      throw new BadRequestError("Password is required!");
    }
    userBody.password = hashPassowrd(userBody.password);
    userBody.roles = [RoleNames.PARTICIPANT];
    try {
      const user = await new UserModel(userBody).save();
      const payload = {
        id: user.id,
      };
      const secret = process.env.JWT_SECRET;
      const token = jwt.sign(payload, secret as string, {
        expiresIn: TOKEN_EXPIRY_TIME,
      });
      user.password = "";
      return {
        token,
        user,
      };
    } catch (e) {
      throw new ConflictError("User with this email already exists");
    }
  }
}
