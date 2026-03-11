import { Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface DecodedToken extends JwtPayload {
  _id: string;
  email?: string;
  name?:string;
}
export interface AuthSocket extends Socket {
  user?: DecodedToken;
  token?: string;
}

export const socketAuth = (socket: AuthSocket, next: any) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY!
    ) as DecodedToken;

    socket.user = decoded;
    socket.token = token; // store original token

    next();
  } catch (error) {
    console.log(error);
    next(new Error("Invalid token"));
  }
};
