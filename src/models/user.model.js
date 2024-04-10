import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            
            required: true,
        },
        coverImage: {
            type: String,
           
           
        },
        watchHistory: [
            {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
       password: {
        type: String,
        required: [true, 'Password is required'],
       },
       refreshToken: {
        type: String,
        
       }
       

    }
, {timestamps: true});

userSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password")) return next();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;

        next();
    } catch (error) {
        next(error);
    }
});


userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function (){
   try {
     return jwt.sign (
         {
             _id: this._id,
             email: this.email,
             username: this.username,
             fullName: this.fullName,
         },
         process.env.ACCESS_TOKEN_SECRET,
         {
             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
         }
     )
   } catch (error) {
         console.error("Error generating access token: ", error);
   }
}


userSchema.methods.generateRefreshToken = function (){
   try {
     return jwt.sign (
         {
             _id: this._id,
            
         },
         process.env.REFRESH_TOKEN_SECRET,
         {
             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
         }
     )
   } catch (error) {
         console.error("Error generating refresh token: ", error);
    
   }
}

export const User = mongoose.model('User', userSchema);