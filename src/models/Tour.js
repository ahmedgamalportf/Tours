const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
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

    tourType: {
      type: String,
      required: true,
      enum: [
        'pyramids',
        'cairo',
        'giza',
        'alexandria',
        'luxor',
        'aswan',
        'abu_simbel',
        'nile',
        'red_sea',
        'hurghada',
        'sharm_el_sheikh',
        'dahab',
        'siwa',
        'desert',
        'white_desert',
        'fayoum',
        'sinai',
        'saqqara',
        'memphis',
        'egyptian_museum',
        'islamic_cairo',
        'coptic_cairo',
        'food',
      ],
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

    meetingPoint: {
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
          if (this instanceof mongoose.Query) {
            const update = this.getUpdate();
            const capacity = update.capacity ?? update.$set?.capacity;

            return capacity === undefined || value <= capacity;
          }

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
          'transportation',
          'tour guide',
          'entry tickets',
          'lunch',
          'dinner',
          'soft drinks',
          'water',
          'hotel pickup',
          'hotel dropoff',
          'airport pickup',
          'airport dropoff',
          'private car',
          'shared bus',
          'camel ride',
          'horse carriage',
          'felucca ride',
          'boat ride',
          'snorkeling',
          'safari',
          'camping',
          'tickets',
          'taxes',
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

tourSchema.pre('validate', function () {
  if (this.startDateTime && this.endDateTime) {
    this.durationHours = (this.endDateTime - this.startDateTime) / (1000 * 60 * 60);
  }
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
