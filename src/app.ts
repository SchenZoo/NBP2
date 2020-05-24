import express = require("express");
import cors = require("cors");
import Container from "typedi";
import {
  RoutingControllersOptions,
  useContainer as RoutingUseContainer,
  useExpressServer,
  Action,
} from "routing-controllers";
import passport = require("passport");
import helmet = require("helmet");
import { GlobalErrorHandler } from "./api/middlewares/GlobalErrorHandler";
import { JwtStrategy } from "./auth/JwtStrategy";
import AnonymousStrategy from "passport-anonymous";
import { JsonInterceptor } from "./api/interceptors/JsonInterceptor";
import "./api/database/MongoConnection";
import "./api/database/models/index";
import "./polyfills";
import Controllers from "./api/controllers";

RoutingUseContainer(Container);
export const app: express.Application = express();
app.use("/public", express.static("public"));
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: 20 * 1024 * 1024 }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
passport.use("jwt", JwtStrategy);
passport.use(new AnonymousStrategy());

const port: number = (process.env.APP_PORT || 3000) as number;
const appEnv: string = (process.env.APP_ENV || "local") as string;
app.set("port", port);
app.set("env", appEnv);

useExpressServer(app, {
  routePrefix: "/api",
  controllers: Object.values(Controllers),
  middlewares: [GlobalErrorHandler],
  validation: true,
  defaults: { nullResultCode: 404, undefinedResultCode: 404 },
  development: appEnv !== "prod",
  classTransformer: true,
  defaultErrorHandler: false,
  interceptors: [JsonInterceptor],
  currentUserChecker: (action: Action) => action.request.user,
});
