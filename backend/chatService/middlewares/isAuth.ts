import { Request, Response, NextFunction } from "express";
import jwt,{type JwtPayload} from "jsonwebtoken"

export interface DecodedToken extends JwtPayload {
  _id: string;
  email?: string;
}

export interface AuthenticatedRequest extends Request{
      user?:DecodedToken;
      
}

export const isAuth = async(req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token =
  req.cookies?.token ||
  req.header("Authorization")?.replace("Bearer ", "");
     console.log("token : ",token);
  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = await jwt.verify(token, process.env.SECRET_KEY!) as DecodedToken;
   
    req.user = decoded;

    console.log("===== AUTH DEBUG =====");
console.log("Cookies:", req.cookies);
console.log("Auth Header:", req.headers.authorization);
console.log("Extracted Token:", token);
console.log("======================");
    next();
  } catch {
    res.clearCookie("token");
    return res.status(401).json({ message: "Invalid token" });
  }
};
