const mongoose = require('mongoose');

const cruiseTripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    cruiseType: {
      type: String,
      required: true,
      enum: ['yacht', 'cruise'],
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    marinaName: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    mapLink: {
      type: String,
      required: true,
      trim: true,
    },

    startDateTime: {
      type: Date,
      required: true,
    },

    endDateTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return !this.startDateTime || value > this.startDateTime;
        },
        message: 'End date time must be after start date time',
      },
    },

    durationHours: {
      type: Number,
      min: 0,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    availableSeats: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          return value <= this.capacity;
        },
        message: 'Available seats cannot be greater than capacity',
      },
    },

    pricePerPerson: {
      type: Number,
      required: true,
      min: 0,
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    includes: [
  {
    type: String,
    trim: true,
    enum: [
      'lunch',
      'soft drinks',
      'snorkeling',
      'fishing',
      'life jacket',
      'tour guide',
      'hotel transfer',
      'music',
      'photography',
            ],
        },
    ],


    isAvailable: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: true,
  }
);

cruiseTripSchema.pre('validate', function () {
  if (this.startDateTime && this.endDateTime) {
    this.durationHours = (this.endDateTime - this.startDateTime) / (1000 * 60 * 60);
  }
});

const CruiseTrip = mongoose.model('CruiseTrip',cruiseTripSchema);
module.exports = CruiseTrip;
