import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const userSchema= new  mongoose.Schema({
name:{
    type: String,
    required: true,
    trim :true,
},
email:{
    type: String,
    required: true,
    lowercase: true,
},
password:{
    type: String,
    required: true,
    select : false,
},
role:{
    type: String,
    enum: ["User","Admin"],
    default: "User",
},
accountVerified :{  
    type: Boolean,
    default: false,
},
avatar: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
borrowedBooks:[
    {
        bookId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Borrow",
        },
        returned:{
            type: Boolean,
            default: false, 
        },
        bookTitle: String,
        borrowedDate: Date,
        dueDate: Date,
    }
],
verificationCode: Number,
verificationCodeExpire: Date,
resetPasswordToken : String,
resetPasswordTokenExpire: Date,
}
,
{
timestamps : true,
})

// userSchema.methods.generateVerificationCode=function(){
// const generateRandomFiveDigits=()=>{
//     const firstDigit=Math.floor(Math.random()*9)+1;
//     const remaningDigits=Math.floor(Math.random()*1000).toString().padStart(4,0);
//     return parseInt(firstDigit+remaningDigits);
// }    
// const verificationCode=generateRandomFiveDigits();
// this.verificationCode=verificationCode;
// this.verificationCodeExpire=Date.now()+15*60*1000;
// return verificationCode;
// }

userSchema.methods.generateVerificationCode = function () {
    // this math gives you [10000…99999], i.e. exactly 5 digits with non-zero first digit
    const code = Math.floor(10000 + Math.random() * 90000);
  
    this.verificationCode       = code;
    this.verificationCodeExpire = Date.now() + 15 * 60 * 1000;

    return code;
  };
  
  userSchema.methods.generateToken=function(){
    return jwt.sign(
        { id: this._id},
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRE }
      );
      
  }

/**
 * @desc   Generate a password-reset token (UUID v4) and its SHA-256 hash + expiry
 * @returns {string}    The **plain** token to email to the user
 */
userSchema.methods.getResetPasswordToken = function () {
  
    const resetToken = crypto.randomBytes(20).toString("hex");
  
    // 2) Hash it and store on the user record
    this.resetPasswordToken = crypto.createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    // 3) Set expiration time (15 minutes from now)
    this.resetPasswordTokenExpire = Date.now() + 15 * 60 * 1000;
  
    // 4) Return the plain token so we can send it via email
    return resetToken;
  };

export const User =mongoose.models.User || mongoose.model("User", userSchema);
