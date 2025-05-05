import jwt from 'jsonwebtoken';

import { findUserById } from '../services/userServices.js';
import { catchAsyncErrors } from './catchAsyncError.js';
import { ErrorHandler } from './errorMiddlewares.js';

export const isAuthenticated =catchAsyncErrors(async(req,res,next)=>{
    const {token}=req.cookies;
    if(!token)
        return next(new ErrorHandler("User is not authenticated",400));
    const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
    req.user=await findUserById(decoded.id);
    next();
})

export const isAuthorized=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role))
            return next(new ErrorHandler(`User with this ${req.user.role} does not have access to this page`,403))
    next();
    }  
}
