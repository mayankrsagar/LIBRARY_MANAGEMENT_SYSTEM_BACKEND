import { v2 as cloudinary } from 'cloudinary';

import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import { ErrorHandler } from '../middlewares/errorMiddlewares.js';
import {
  adminCreatedByAdmin,
  allUser,
  findUserByEmail,
} from '../services/userServices.js';
import { hashPassword } from '../utils/password.js';

export const getAllUsers=catchAsyncErrors(async (req,res,next)=>{
    const gotAllUser=await allUser();
    res.status(200).json({
        success:true,
        gotAllUser,
        message:"successfully fetched all user"
    })
});


export const registerNewAdmin=catchAsyncErrors(async (req, res, next)=>{
    if(!req.files || Object.keys(req.files).length===0)
        return next(new ErrorHandler("Admin avatar is required",404));
    const {name ,email, password}=req.body|| {};
  
    if(!name || !email || !password)
        return next(new ErrorHandler("Please enter all field",400));
    const isRegistered=await findUserByEmail(email);
    if(isRegistered)
        return next(new ErrorHandler("User is already registered",400));
    if(password.length <8 || password.length >16)
        return next(new ErrorHandler("Password length should be between 8 and 16",400));
    const avatar = req?.files?.avatar;

    if (!avatar) {
      return next(new ErrorHandler("Admin avatar is required", 404));
    }
    


    const allowedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if(!allowedFormats.includes( avatar.mimetype ))
        return next(new ErrorHandler("File format is not supported",400));
    const hashedPassword=await hashPassword(password);
    const cloudinaryResponses=await cloudinary.uploader.upload(avatar.tempFilePath,{
        folder:"LIBRARY_MANAGEMENT_SYSTEM_ADMIN_AVATARS",
    });

    if(!cloudinaryResponses || cloudinaryResponses.error){
        console.error("Cloudinary Error: ", cloudinaryResponses.error || "Unknown Cloudinary error");
    return next(new ErrorHandler("Failed to Upload image on Cloudinary",500));
    }

    const updatedData={
        name,
        email,
        password:hashedPassword,
        role: "Admin",
        accountVerified: true,
        avatar: {
            public_id: cloudinaryResponses.public_id,
            url: cloudinaryResponses.secure_url,
        }
    }

const admin=await adminCreatedByAdmin(updatedData);

return res.status(200).json({
    success: true,
    message:"Admin created successfully",
    admin
})

});


