import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        console.log("Token:", token);

        if (typeof token !== "string" || token.length === 0) {
            throw new ApiError(401, "Token is not a valid string");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        console.log("Decoded Token:", decodedToken);

        if (!decodedToken || typeof decodedToken !== "object") {
            throw new ApiError(401, "Decoded token is not a valid object");
        }

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error verifying JWT:", error.message);
        next(error); // Pass the error to the global error handler middleware
    }
});
