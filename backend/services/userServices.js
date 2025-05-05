// services/userServices.js

import { User } from '../models/userModel.js';

/**
 * Find a user by email, only if their account is verified.
 * @param {string} email
 * @returns {Promise<User|null>}
 */
// for login
export const findUserWithPassword = email =>
  User.findOne({ email, accountVerified: true })
      .select('+password')
      .exec();

// for other checks
export const findUserByEmail = email =>
  User.findOne({ email, accountVerified: true })
      .exec();



/**
 * Count how many registration attempts exist for this email
 * where the account is still unverified.
 * @param {string} email
 * @returns {Promise<number>}
 */
export const registrationAttemptsByUser = async (email) => {
  return User
    .countDocuments({ email, accountVerified: false })
    .exec();
};

/**
 * Create a new user record.
 * @param {{ email: string, name: string, password: string }} data
 * @returns {Promise<User>}
 */
export const createUser = async ({ email, name, password }) => {
  return User.create({ email, name, password });
};
export const adminCreatedByAdmin=async(data)=>{
  return User.create(data);
}

export const findUserById=async(id)=>{
  return await User.findById(id);
}

export const findUserByIdWithPassword=async(id)=>await User.findById(id).select("+password");

export const findUserByResetToken=async(resetPasswordToken)=>{
  // console.log(resetPasswordToken);
  return await User.findOne({
    resetPasswordToken,
    resetPasswordTokenExpire: { $gt: Date.now() },
  })
}

export const getAllUsersExpectAdmin=async()=>{
  return User.find({role:"User"});
}

export const allUser=async ()=>{
  return User.find({accountVerified:true});
}
