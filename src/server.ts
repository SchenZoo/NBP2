import "reflect-metadata";
import { initializeEnvironment } from "./config/Environment";
initializeEnvironment();
import http = require("http");
import stoppable = require("stoppable");
import { app } from "./app";
import Container from "typedi";
import { SocketService } from "./api/services/SocketService";
import "./api/subscribers/MessageSubscriber";
import "./api/subscribers/NotificationSubscriber";
import { API_PATH } from "./api/configurations/paths";

const server = stoppable(http.createServer(app));
Container.set(SocketService, new SocketService(server));
const port = app.get("port");
server.listen(app.get("port"));
server.on("error", onError);
server.on("listening", onListening);

process.on("SIGTERM", () => {
  console.time("Server turning off.");
  try {
    server.stop(() => {
      console.timeEnd("Server turning off.");
      console.log("Http server closed.");
      process.exit(0);
    });
    setTimeout(() => {
      console.log("Force close.");
      process.exit(1);
    }, 5000);
  } catch (exception) {
    console.error("Error closing server");
    console.error(exception);
    process.exit(1);
  }
});

process.on("uncaughtException", () => {
  console.log("uncaughtException");
});

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  console.log("Listening on " + API_PATH);
}
