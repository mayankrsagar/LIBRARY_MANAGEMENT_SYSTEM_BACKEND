import mongoose from 'mongoose';

const borrowSchema = new mongoose.Schema({
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId, 
            required: true,
            ref: "User"
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        }
    },
    price: {
        type: Number,
        required: true,
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Book"
    },
    borrowDate: {
        type: Date,
        required: true,
        default: Date.now  
    },
    dueDate: {
        type: Date,
        required: true,
    },
    returnDate: {
        type: Date ,
        default:null,
    },
    fine: {
        type: Number,
        default: 0,
    },
    // status: {  // Added status field for better tracking
    //     type: String,
    //     enum: ['borrowed', 'returned', 'overdue'],
    //     default: 'borrowed'
    // },
    notified: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true  
});

const Borrow =mongoose.models.Borrow || mongoose.model('Borrow', borrowSchema);
export default Borrow;