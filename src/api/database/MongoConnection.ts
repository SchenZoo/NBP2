import mongoose = require("mongoose");
import "reflect-metadata";
import { initializeEnvironment } from "../../config/Environment";
initializeEnvironment();

import {
  MONGO_URL,
  MONGO_CONNECTION_OPTIONS,
} from "../../config/MongoDBOptions";

class MongoConnection {
  constructor() {
    this.connect();
  }
  connect() {
    mongoose
      .connect(MONGO_URL, MONGO_CONNECTION_OPTIONS)
      .then((res) => {
        console.log("Connected to mongo " + MONGO_URL);
      })
      .catch((err) => {
        console.log(err);
        console.error("Database connection error");
      });
  }
}

export default new MongoConnection();
