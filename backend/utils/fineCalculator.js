export const calculateFine=(dueDate)=>{
    const today=new Date();
    const finePerHour=0.5;
    if(today> dueDate){
      const diffTime=Math.ceil((today-dueDate)/(1000*60*60));

      const fine=diffTime* finePerHour;
      return fine;
    }
    return 0;
}