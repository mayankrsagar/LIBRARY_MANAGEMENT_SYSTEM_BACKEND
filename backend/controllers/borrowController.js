import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import { ErrorHandler } from '../middlewares/errorMiddlewares.js';
import Borrow from '../models/borrowModel.js';
import { getBookById } from '../services/bookServices.js';
import { getAllBorrow } from '../services/borrowService.js';
import { findUserByEmail } from '../services/userServices.js';
import { calculateFine } from '../utils/fineCalculator.js';

export const recordBorrowedBook=catchAsyncErrors(async (req,res,next)=>{
   const {id}=req.params;
   const {email}=req.body|| {};
   const book= await getBookById(id);
   if(!book)
    return next(new ErrorHandler("Book not found",404));
const user=await findUserByEmail(email);
if(!user)
    return next(new ErrorHandler("User not found",404));
if(book.quantity=== 0)
    return next(new ErrorHandler("Book is out of Stock! Come back later.",404));

const isAlreadyBorrowed=user.borrowedBooks.find(b=>b.bookId.toString() === id && b.returned === false);

if(isAlreadyBorrowed)
    return next(new ErrorHandler("Book is not returned and take one book at a time",404));

book.quantity-=1;
book.availability=book.quantity>0 
await book.save();
user.borrowedBooks.push({
    bookId:id,
    returned:false,
    bookTitle: book.title,
    borrowedDate: new Date(),
    dueDate: new Date(Date.now()+7*24*60*60*1000),
})
await user.save();
const borrowedBookUpdate={
    user:{
        id:user._id,
        name:user.name,
        email: user.email
    },
    price:book.price,
    book:id,
    dueDate: new Date(Date.now()+7*24*60*60*1000),
};
    const borrowedBookUser=await Borrow.create(borrowedBookUpdate);
    res.status(200).json({
        success:true,
        message:"Borrowed book record Success",
        data: borrowedBookUser,
    })
});

export const returnBorrowBook=catchAsyncErrors(async(req,res,next)=>{
    const {bookId}=req.params;
    const {email}=req.body|| {};
    const book=await getBookById(bookId);
    if(!book)
        return next(new ErrorHandler("Book not found!", 404));
    const user=await findUserByEmail(email);
    if(!user)
        return next(new ErrorHandler("User not found!",404));
    const borrowedBook=user.borrowedBooks.find(b=>b.bookId.toString()===bookId && b.returned ===false);

    if(!borrowedBook)
        return next(new ErrorHandler("Book Not borrowed",404));

    borrowedBook.returned=true;
   await user.save();

   book.quantity+=1;
   book.availability=book.quantity>0;
   await book.save();
    
const borrow=await Borrow.findOne({
    book:bookId,
    "user.email":email,
    returnDate:null,
})

if(!borrow)
    return next(new ErrorHandler("You have not borrowed this book",400));
borrow.returnDate= new Date();
const fine=calculateFine(borrow.dueDate);
borrow.find=fine;
await borrow.save(); 

res.status(200).json({
    success:true,
    message: fine !==0? `Your book is overdue and is liable to fine rupees${fine +book.price} `:` The book has been returned successfully. The total charges are ${book.price} rupees`
})

});
export const borrowedBooks=catchAsyncErrors(async(req,res,next)=>{
    const {borrowedBooks}=req.user|| [];
    console.log(req.user)
    res.status(200).json({
        success:true,
        message:borrowedBooks.length===0 ? "No Book to show": "Book is successfully fetched",
        data: borrowedBooks,
    })
})
export const getBorrowedBooksForAdmin=catchAsyncErrors(async (req,res,next)=>{
    const allBooks=await getAllBorrow();
    res.status(200).json({
        success:true,
        message:allBooks.length===0 ? "No Book to show": "Book is successfully fetched",
        data: allBooks,
    })
});
