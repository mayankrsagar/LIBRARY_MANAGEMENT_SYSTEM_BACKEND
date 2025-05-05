import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import { ErrorHandler } from '../middlewares/errorMiddlewares.js';
import * as BookServices from '../services/bookServices.js';

export const addBook=catchAsyncErrors(async(req,res,next)=>{
    const {title,description,price,author,quantity }=req.body|| {};
    if(!title || !description || !price || !author || !quantity)
        return next(new ErrorHandler("Please enter all required field",400));
    const addedBooks=await BookServices.addBookService(req.body);
    res.status(201).json({
        message:"Book added successfully",
        success: true,
        addedBooks,
    })
})

export const getAllBooks=catchAsyncErrors(async(req,res,next)=>{
    const books=await BookServices.getBooks();
    res.status(200).json({
        message:"Books fetched successfully",
        data: books,
        success: true,
    })
})

export const deleteBook=catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
    if(!id)
        return next(new ErrorHandler("Id is not given.",400));
    const deletedData=await BookServices.deleteBook(id);
    if(!deletedData)
        return next(new ErrorHandler("No Book Found with given id"),400);
    res.status(200).json({
        success:true,
        message:"Book Deleted Successfully",
        data: deletedData, 
    })
})

