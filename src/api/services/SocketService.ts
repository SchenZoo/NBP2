import { Service } from "typedi";
import socket, { Server } from "socket.io";
import { StoppableServer } from "stoppable";
import { IUser } from "../database/models/User";
import jwt = require("jsonwebtoken");
import { getUserRoom } from "../../constants/SocketRoomNames";

@Service()
export class SocketService {
  public io: Server;
  constructor(server: StoppableServer) {
    this.io = socket.listen(server);
    this.io.on("connect", this.onConnect());
  }

  sendEventInRoom(eventName: string, eventPayload: any, room: string) {
    this.io.to(room).emit(eventName, eventPayload);
  }

  private onConnect() {
    return (socketClient: socket.Socket) => {
      const token = socketClient.request._query.token;
      const user = JSON.parse(socketClient.request._query.user) as IUser;
      if (!user) {
        return socketClient.disconnect(true);
      }

      try {
        jwt.verify(token, process.env.JWT_SECRET as any);
      } catch (e) {
        return socketClient.disconnect(true);
      }

      socketClient.join(getUserRoom(user.id));
      socketClient.on("disconnect", this.onDisconnect(user.id));
    };
  }

  private onDisconnect(userId: number) {
    return () => {
      //
    };
  }
}
