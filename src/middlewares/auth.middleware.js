
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
  // get token from cookies
  // verify token
  // get user from token
  // attach user to req object
  // call next
 try {
     const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
     if (!accessToken) {
       throw new ApiError(401, "Access token not found");
     }
     const decodedToken = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
     const user = await User.findById(decodedToken?. _id).select("-password -refreshToken");
     if (!user) {
       throw new ApiError(401, "Invalid Access Token");
     }
     req.user = user;
     next();
 } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
 }
});