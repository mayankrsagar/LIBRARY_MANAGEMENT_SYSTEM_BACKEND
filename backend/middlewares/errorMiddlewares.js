export class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
      }
}

//when call with next(err) will pass it to app.use(errorMiddleware).
export const errorMiddleware=(err, req,res, next)=>{
err.message=err.message|| "Internal Server Error";
err.statusCode=err.statusCode || 500;
let status;
let message;
if(err.code ===11000){
  const statusCode=400;
  const message="Duplicate Feild value entered";
  err=new ErrorHandler(message, statusCode);
}
if(err.name=== "JsonWebTokenError"){
  const statusCode=400;
  const message="Json web token is invalid. Try again";
  err=new ErrorHandler(message,statusCode);
}

if(err.name === "TokenExpiredError"){
  const statusCode=400;
  const message="Json web token is expired. Try again";
  err=new ErrorHandler(message, statusCode);
}
if(err.name === "CastError"){
  const statusCode=400;
  const message=`Resources not found. Invalid ${err.path}`;
  err=new ErrorHandler(message,statusCode)
}

const errorMessage=err.errors ?Object.values(err.errors).map((error)=>error.message).join(" ") : err.message;
res.status(err.statusCode).json({success:false ,message: errorMessage});
}