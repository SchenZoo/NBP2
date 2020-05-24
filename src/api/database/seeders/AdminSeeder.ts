import "../MongoConnection";
import { UserModel, IUser } from "../models/User";
import { RoleNames } from "../../../constants/RoleNames";
import { hashPassowrd } from "../../misc/Hash";

(async () => {
  const admin = new UserModel({
    username: "Admin",
    name: "Stane",
    password: hashPassowrd("asdlolasd"),
    roles: [RoleNames.ADMIN],
    email: "stankovic.aleksandar@elfak.rs",
  });
  try {
    await admin.save();
    console.log("Admin created");
    process.exit(0);
  } catch (err) {
    console.error(err);
    console.log("You have already created this user");
    process.exit(1);
  }
})();
