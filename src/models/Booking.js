const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    bookingType: {
      type: String,
      required: true,
      enum: ['room', 'cruiseTrip', 'tour'],
    },

    itemModel: {
      type: String,
      required: true,
      enum: ['Room', 'CruiseTrip', 'Tour'],
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'itemModel',
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    checkInDate: {
      type: Date,
      required: function () {
        return this.bookingType === 'room';
      },
    },

    checkOutDate: {
      type: Date,
      required: function () {
        return this.bookingType === 'room';
      },
      validate: {
        validator: function (value) {
          return this.bookingType !== 'room' || !value || value > this.checkInDate;
        },
        message: 'Check out date must be after check in date',
      },
    },

    roomsCount: {
      type: Number,
      min: 1,
      required: function () {
        return this.bookingType === 'room';
      },
    },

    personsCount: {
      type: Number,
      min: 1,
      required: function () {
        return this.bookingType === 'tour' || this.bookingType === 'cruiseTrip';
      },
    },

    guests: {
      adults: {
        type: Number,
        min: 1,
        default: 1,
      },
      children: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    tripStartDate: {
      type: Date,
    },

    tripEndDate: {
      type: Date,
    },

    nightsCount: {
      type: Number,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'USD',
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
      default: 'pending',
    },

    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
    },

    specialRequests: {
      type: String,
      trim: true,
    },

    itemSnapshot: {
      title: {
        type: String,
        trim: true,
      },
      name: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
      image: {
        type: String,
        trim: true,
      },
    },

    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

bookingSchema.pre('validate', function () {
  const modelByType = {
    room: 'Room',
    cruiseTrip: 'CruiseTrip',
    tour: 'Tour',
  };

  if (this.bookingType) {
    this.itemModel = modelByType[this.bookingType];
  }

  if (this.bookingType === 'room' && this.checkInDate && this.checkOutDate) {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    this.nightsCount = Math.ceil((this.checkOutDate - this.checkInDate) / millisecondsPerDay);
  }

  if (this.bookingType !== 'room') {
    this.roomsCount = undefined;
    this.guests = undefined;
    this.checkInDate = undefined;
    this.checkOutDate = undefined;
    this.nightsCount = undefined;
  }

  if (this.bookingType === 'room') {
    this.personsCount = undefined;
    this.tripStartDate = undefined;
    this.tripEndDate = undefined;
  }
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
