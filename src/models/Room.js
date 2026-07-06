const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({

hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
    },
    roomName: {
      type: String,
      required: true,
      trim: true,
    },

    roomType: {
      type: String,
      required: true,
      enum: ['single', 'double', 'triple', 'suite', 'deluxe', 'family'],
    },

    description: {
      type: String,
      trim: true,
    },

    capacity: {
      adults: {
        type: Number,
        required: true,
        min: 1,
      },
      children: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    totalRooms: {
      type: Number,
      required: true,
      min: 1,
    },

    availableRooms: {
      type: Number,
      required: true,
      min: 0,
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
        },
      },
    ],

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model('Room',roomSchema);
module.exports = Room;