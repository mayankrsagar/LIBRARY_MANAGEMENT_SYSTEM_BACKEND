// controllers/authController.js

import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import { ErrorHandler } from '../middlewares/errorMiddlewares.js';
import { User } from '../models/userModel.js';
import {
  createUser,
  findUserByEmail,
  findUserByIdWithPassword,
  findUserByResetToken,
  findUserWithPassword,
  registrationAttemptsByUser,
} from '../services/userServices.js';
import {
  generateForgotPasswordEmailTemplate,
} from '../utils/emailTemplates.js';
import { hashPassword } from '../utils/password.js';
import { sendEmail } from '../utils/sendEmail.js';
import { sendToken } from '../utils/sendToken.js';
import { sendVerificationCode } from '../utils/sendVerificationCode.js';

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body|| {};

  // 1) Required fields
  if (!name || !email || !password) {
    return next(new ErrorHandler('Please enter all fields', 400));
  }

  // 2) Prevent duplicate, verified user
  if (await findUserByEmail(email)) {
    return next(new ErrorHandler('User already exists', 400));
  }

  // 3) Throttle unverified attempts
  const attempts = await registrationAttemptsByUser(email);
  if (attempts >= 5) {
    return next(new ErrorHandler(
      'You have exceeded the number of registration attempts. Please contact support',
      400
    ));
  }

  // 4) Password policy
  if (password.length < 8 || password.length > 16) {
    return next(new ErrorHandler(
      'Password length should be between 8 and 16 characters',
      400
    ));
  }

  // 5) Hash and create user
  const hashedPwd = await hashPassword(password);
  const user = await createUser({ name, email, password: hashedPwd });

  // 6) Generate & save verification code
  const code = user.generateVerificationCode();
  await user.save();

  // 7) Send OTP email (uses your sendVerificationCode util)
  await sendVerificationCode(code, email, res);

  // 8) Respond
  res.status(200).json({
    success: true,
    data: user,
    message: 'User is registered successfully; OTP sent to email.'
  });
});

export const verifyOtp=catchAsyncErrors(async(req,res,next)=>{
const {email,otp}=req.body || {};
try {
  if(!email || !otp){
    return next(new ErrorHandler("Email and code are required.",400));
  }
  console.log(`Email is from backend${email}`)
  const userAllEntries=await User.find({
    email,
    accountVerified: false,
  }).sort({createdAt: -1});
if (userAllEntries.length === 0) {
  return next(new ErrorHandler("No pending verification for this email", 400));
}

let user;
if(userAllEntries.length>1){
  user=userAllEntries[0];
  await User.deleteMany({
    _id: {$ne :user._id},
    email,
    accountVerified:false
  })
}else{
  user=userAllEntries[0];
}

if (user.verificationCode !== Number(code)) {
  return next(new ErrorHandler('Invalid verification code', 400));
}

if (Date.now() > user.verificationCodeExpire) {
  return next(new ErrorHandler('Verification code expired', 400));
}

user.accountVerified         = true;
user.verificationCode        = null;
user.verificationCodeExpire  = null;

await user.save({validateModifiedOnly: true});

await sendToken(user, 200, "Account Verified.", res);

} catch (error) {
 
  res.status(500).json({
    message:"Internal Server error"
  })
}
})

export const login=catchAsyncErrors(async(req,res,next)=>{
  const {email,password}=req.body|| {};
  
  if(!email || !password)
    return next(new ErrorHandler("Please enter all field",400));
  
  const user=await findUserWithPassword(email);
  if(!user)
    return next(new ErrorHandler("Wrong password or email",400));
  const matchedPassword=await bcrypt.compare(password,user.password);
  if(!matchedPassword)
    return next(new ErrorHandler("wrong password or email",400));
  await sendToken(user,200,"User successfully logged",res);
})

export const logout = (req, res) => {
  // 1) Clear the 'token' cookie by setting it to an empty value
  //    with an expiration date in the past (or use clearCookie).
  res
    .status(200)
    .cookie('token', '', {
      expires: new Date(Date.now()),     // immediate expiry
      httpOnly: true,           // not accessible to client-side JS
      // secure: process.env.NODE_ENV === 'production',
      // sameSite: 'lax',
    })
    .json({
      success: true,
      message: 'Successfully logged out',
    });
};

export const getUser=(req,res)=>{
 const user=req.user;
 res.status(200).json({
  success:true,
  data:user,
 })
}

export const forgotPassword=catchAsyncErrors(async(req,res,next)=>{
  const {email}=req.body || {};
  if(!email)
    return next(new ErrorHandler("Please fill the email to reset password",400));
  const user=await findUserByEmail(email);
  if(!user)
    return next(new ErrorHandler("User dosen't exist! Enter correct password",400));

  const resetToken=user.getResetPasswordToken();
 
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl=`${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message=generateForgotPasswordEmailTemplate(resetPasswordUrl,email);
  try {
    await sendEmail({email,subject:"BookWorm Library Management System Password Recovery",
      message,
    })
    res.status(200).json({
      success:true,
      message:`Email sent to ${user.email} successfully`,
    })
  } catch (error) {
    user.resetPasswordToken=undefined;
    user.resetPasswordTokenExpire=undefined;
    await user.save({validateBeforeSave:false});
    return next(new ErrorHandler(error.message,500));
  }
})

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const rawToken = req.params.token;
const token    = rawToken.trim(); 
  const { password, confirmPassword } = req.body || {};

  // 1) Check inputs
  if (!password || !confirmPassword) {
    return next(new ErrorHandler(
      'Please provide both password and confirmPassword',
      400
    ));
  }
  if (password !== confirmPassword) {
    return next(new ErrorHandler('Passwords do not match', 400));
  }
  if (password.length < 8 || password.length > 16) {
    return next(new ErrorHandler(
      'Password length should be between 8 and 16 characters',
      400
    ));
  }

  // 2) Hash the URL-token and find the user in one step
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');


  const user = await findUserByResetToken(hashedToken);
  if (!user) {
    return next(new ErrorHandler(
      'Reset password token is invalid or has expired',
      400
    ));
  }

  // 3) Update password & clear reset fields
  user.password                 = await hashPassword(password);
  user.resetPasswordToken       = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save();

  // 4) Issue new JWT + cookie + JSON
  return sendToken(user, 200, 'Password has been reset successfully', res);
});


// export const updatePassword=catchAsyncErrors(async(req,res,next)=>{
//   const user=await findUserByIdWithPassword(req.user._id);
  
//   const {currentPassword, newPassword, confirmNewPassword}=req.body|| {};
//   if (!currentPassword || !newPassword || !confirmNewPassword) {
//     return next(new ErrorHandler('Please enter all fields', 400));
//   }

//   if (newPassword !== confirmNewPassword) {
//     return next(new ErrorHandler('New passwords do not match', 400));
//   }
//   if (newPassword.length < 8 || newPassword.length > 16) {
//     return next(new ErrorHandler(
//       'Password must be between 8 and 16 characters',
//       400
//     ));
//   }
//   if (!user) {
//     return next(new ErrorHandler('User not found', 404));
//   }
  

//   const isMatch = await bcrypt.compare(currentPassword, user.password);
//   if (!isMatch) {
//     return next(new ErrorHandler('Current password is incorrect', 401));
//   }

// const hashedPassword=await hashPassword(newPassword);
// user.password=hashedPassword;

// await user.save();

// res.status(200).json({
//   success: true,
//   message:"Updated the password successfully"
// })

// // return sendToken(user, 200, 'Password updated successfully', res);

// })

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user && req.user.id; // assuming you set req.user in isAuthenticated
  const { currentPassword, newPassword, confirmNewPassword } = req.body || {};

  // 1) Ensure all fields are provided
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler('Please enter all fields', 400));
  }

  // 2) Confirm new passwords match and length policy
  if (newPassword !== confirmNewPassword) {
    return next(new ErrorHandler('New passwords do not match', 400));
  }
  if (newPassword.length < 8 || newPassword.length > 16) {
    return next(new ErrorHandler(
      'Password must be between 8 and 16 characters',
      400
    ));
  }

  // 3) Load the user including their hashed password
  const user = await findUserByIdWithPassword(userId);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }
  
  
  // 4) Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return next(new ErrorHandler('Current password is incorrect', 401));
  }

  // 5) Hash & set the new password
  user.password = await hashPassword(newPassword);
  await user.save();

  // 6) Issue a new token (or just send success)
  return sendToken(user, 200, 'Password updated successfully', res);
});

