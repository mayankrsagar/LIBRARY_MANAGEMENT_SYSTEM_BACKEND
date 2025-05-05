import { Book } from '../models/bookModel.js';

export const addBookService = async (details) => {
    // shallow clone
    const payload = { ...details };
    const created = await Book.create(payload);
    return created;
  };
  
  export const getBooks=async()=>{
    return await Book.find({});
  }

  export const deleteBook=async(id)=>{
    return await Book.findByIdAndDelete(id);
  }

  export const getBookById=async(id)=>{
    return await Book.findOne({_id:id});
  }