const mongoose = require('mongoose');

const AddressSchema =  new mongoose.Schema({
    UserID: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        required: true
    },
    City: {
        type: String,
        required: true
    },
    State: {
        type: String,
        required: true
    },
    PinCode: {
        type: Number,
        required: true
    }
});

const Address = mongoose.model('Address', AddressSchema);

module.exports = Address;