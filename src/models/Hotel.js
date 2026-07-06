const mongoose = require ('mongoose');

const hotelSchema = mongoose.Schema({

    name:{
        type:String,
        trim:true,
        required:true
    },
    description:{
        type:String,
        trim:true,
        required:true
    },

    country:{
        type:String,
        trim:true,
        required:true
    },

    address:{
        type:String,
        trim:true,
        required:true
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
   location: {
        type: String,
        required: true,
        trim: true,
    },
        
    images: [
        {
            type: String,
        },
    ],

    roomsAvailable: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },

    isFeatured: {
        type: Boolean,
        default: false,
    },

        isActive: {
        type: Boolean,
        default: true,
        },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },

},
{
    timestamps:true
});

const Hotel = mongoose.model('Hotel',hotelSchema);
module.exports = Hotel;