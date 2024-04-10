import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessandRefreshToken = async(userId) => {
    try {
       // console.log("i am here")
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        //console.log("i am here too")
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken};
    } catch (error) {
        console.log(userId)
        console.log(accessToken)
        console.log(refreshToken)
        throw new ApiError(500, "Failed to generate tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation
    // check if user already exists:: username, email
    // check for images, check for avatar
    // upload them to cloudinary
    // create user object - create entry in db
    // remove password and refresth token field from response
    // ccheck for user crateion
    // send response

    const { username, email, fullName, password } = req.body;
    console.log("email:", email);

    if(
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    const existerUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existerUser){
        throw new ApiError(409, "User with userName or email already exists");
    }
    //console.log(req.files)

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(
        new ApiResponse(201, "User created successfully", createdUser)
    )
   
    

});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
     // find the user
     // password check
     // access token and refresh token
     // send cookies
        // send response

    const { username, email, password } = req.body;
    if(!username && !email){
        throw new ApiError(400, "Username or email is required");
    }

   const user = await User.findOne({
        $or: [{ username: username?.toLowerCase() }, { email }],
    });

    if(!user){
        throw new ApiError(404, "User not found");
    }

   const isPasswordValid = await user.isPasswordCorrect(password);
   if(!isPasswordValid){
       throw new ApiError(401, "Invalid password");
   }

    const {accessToken,refreshToken} = await generateAccessandRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
       
    };
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json( 
        new ApiResponse(200,
            {user: loggedInUser, accessToken, refreshToken},
             "User logged in successfully")
        );


});


const logoutUser = asyncHandler(async (req, res) => {
    // clear cookies
    // send response
    // res.clearCookie("accessToken");
    // res.clearCookie("refreshToken");
    // return res.status(200).json(new ApiResponse(200, "User logged out successfully"));

    await User.findByIdAndUpdate(req.user._id,
    {
        $set: { refreshToken: undefined },
    },
    { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully"));
    });


export { 
    registerUser,
    loginUser,
    logoutUser
 }