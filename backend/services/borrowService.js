import Borrow from '../models/borrowModel.js';

export const getAllBorrow=async ()=>{
    return await Borrow.find({});
}