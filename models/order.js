const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    UserID: {
        type: String,
        required: true
    },
    ProductID: {
        type: String, 
        required: true
    },
    Size: {
        type: String,
        enum: ['S','M','L','XL','XXL','']
    },
    Quantity: {
        type: Number,
        enum: [1,2,3,4,5,6,7,8,9,0]
    },
    OrderDate: {
        type: Date,
        required: true
    },
    TransactionID: {
        type: String,
        required: true
    },
    PaymentMode: {
        type: String,
        enum: ['card','upi','cod']
    },
    Total: {
        type: String,
        required: true
    }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;