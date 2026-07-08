const mongoose = require('mongoose');
const Tour = require('../models/Tour');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validatePagination = (queryParams) => {
  const page = queryParams.page === undefined ? 1 : Number(queryParams.page);
  const limit = queryParams.limit === undefined ? 10 : Number(queryParams.limit);

  if (!Number.isInteger(page) || page < 1) {
    throw createError('Page must be a positive integer', 400);
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw createError('Limit must be a positive integer between 1 and 50', 400);
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const addTours = async (toursData, userId) => {
  const {
    title,
    name,
    description,
    tourType,
    country,
    city,
    meetingPoint,
    mapLink,
    startDateTime,
    endDateTime,
    capacity,
    availableSeats,
    pricePerPerson,
    images,
    includes,
    isAvailable,
    isFeatured,
    isActive,
  } = toursData;

  if ( !title || !name || !description || !tourType || !country || !city || !meetingPoint || !mapLink || !startDateTime || !endDateTime || capacity === undefined || availableSeats === undefined || pricePerPerson === undefined ) {
    throw createError('All required fields must be provided', 400);
  }

  if (!userId) {
    throw createError('Authenticated user is required', 401);
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createError('Invalid user ID', 400);
  }

  if (typeof title !== 'string' || !title.trim()) {
    throw createError('Title must be a non-empty string', 400);
  }

  if (typeof name !== 'string' || !name.trim()) {
    throw createError('Tour name must be a non-empty string', 400);
  }

  if (typeof description !== 'string' || !description.trim()) {
    throw createError('Description must be a non-empty string', 400);
  }

  const allowedTourTypes = [
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
  ];

  if (typeof tourType !== 'string' || !allowedTourTypes.includes(tourType.trim().toLowerCase())) {
    throw createError('Invalid tour type', 400);
  }

  if (typeof country !== 'string' || !country.trim()) {
    throw createError('Country must be a non-empty string', 400);
  }

  if (typeof city !== 'string' || !city.trim()) {
    throw createError('City must be a non-empty string', 400);
  }

  if (typeof meetingPoint !== 'string' || !meetingPoint.trim()) {
    throw createError('Meeting point must be a non-empty string', 400);
  }

  if (typeof mapLink !== 'string' || !mapLink.trim()) {
    throw createError('Map link must be a non-empty string', 400);
  }

  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);

  if (isNaN(startDate.getTime())) {
    throw createError('Start date time must be a valid date', 400);
  }

  if (isNaN(endDate.getTime())) {
    throw createError('End date time must be a valid date', 400);
  }

  if (endDate <= startDate) {
    throw createError('End date time must be after start date time', 400);
  }

  const capacityNumber = Number(capacity);
  const availableSeatsNumber = Number(availableSeats);
  const pricePerPersonNumber = Number(pricePerPerson);

  if (!Number.isInteger(capacityNumber) || capacityNumber < 1) {
    throw createError('Capacity must be an integer greater than or equal to 1', 400);
  }

  if (!Number.isInteger(availableSeatsNumber) || availableSeatsNumber < 0) {
    throw createError('Available seats must be an integer greater than or equal to 0', 400);
  }

  if (availableSeatsNumber > capacityNumber) {
    throw createError('Available seats cannot be greater than capacity', 400);
  }

  if (!Number.isFinite(pricePerPersonNumber) || pricePerPersonNumber < 0) {
    throw createError('Price per person must be a number greater than or equal to 0', 400);
  }

  if (images !== undefined && !Array.isArray(images)) {
    throw createError('Images must be an array', 400);
  }

  if (images !== undefined) {
    for (const image of images) {
      if (typeof image !== 'string') {
        throw createError('Each image must be a string URL', 400);
      }
    }
  }

  const allowedIncludes = [
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
  ];

  if (includes !== undefined && !Array.isArray(includes)) {
    throw createError('Includes must be an array', 400);
  }

  if (includes !== undefined) {
    for (const item of includes) {
      if (typeof item !== 'string' || !allowedIncludes.includes(item.trim().toLowerCase())) {
        throw createError(`${item} is not a valid include option`, 400);
      }
    }
  }

  if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
    throw createError('isAvailable must be boolean', 400);
  }

  if (isFeatured !== undefined && typeof isFeatured !== 'boolean') {
    throw createError('isFeatured must be boolean', 400);
  }

  if (isActive !== undefined && typeof isActive !== 'boolean') {
    throw createError('isActive must be boolean', 400);
  }

  const normalizedName = name.trim();
  const escapedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const existingTour = await Tour.findOne({
    name: { $regex: `^${escapedName}$`, $options: 'i' },
  });

  if (existingTour) {
    throw createError('Tour name is exist already!', 409);
  }

  const tour = await Tour.create({
    title: title.trim(),
    name: normalizedName,
    description: description.trim(),
    tourType: tourType.trim().toLowerCase(),
    country: country.trim(),
    city: city.trim(),
    meetingPoint: meetingPoint.trim(),
    mapLink: mapLink.trim(),
    startDateTime: startDate,
    endDateTime: endDate,
    capacity: capacityNumber,
    availableSeats: availableSeatsNumber,
    pricePerPerson: pricePerPersonNumber,
    images: images ? images.map((image) => image.trim()).filter(Boolean) : [],
    includes: includes ? includes.map((item) => item.trim().toLowerCase()).filter(Boolean) : [],
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    isFeatured: isFeatured !== undefined ? isFeatured : false,
    isActive: isActive !== undefined ? isActive : true,
    createdBy: userId,
  });

  return {
    message: 'Tour created successfully',
    tour,
  };
};

const getAllTours = async(queryParams) => {
    const { page, limit, skip } = validatePagination(queryParams);
    const filter = {
        isActive: true,
    };

    const tours = await Tour.find(filter)
      .select('-createdBy')
      .skip(skip)
      .limit(limit);
    const totalTours = await Tour.countDocuments(filter);

  return {
    message: 'Tours fetched successfully',
    pagination: {
      currentPage: page,
      limit,
      totalTours,
      totalPages: Math.ceil(totalTours / limit),
    },
    tours,
  };
}

const getTourById = async(tourId) => {
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
        throw createError('Invalid tour ID', 400);
    }

    const tour = await Tour.findOne({
        _id: tourId,
        isActive: true,
    }).select('-createdBy');

    if(!tour){
        throw createError('Tour not found', 404);
    }

    return{
        message: 'Tour fetched successfully',
        success: true,
        tour,
    }
}

const getAllToursForAdmin = async(queryParams) => {
    const { page, limit, skip } = validatePagination(queryParams);

    const tours = await Tour.find();
    const totalTours = await Tour.countDocuments();
    return{
        message: 'Tours fetched successfully',
        pagination: {
            currentPage: page,
            limit,
            totalTours,
            totalPages: Math.ceil(totalTours / limit),
        },tours,
    }; 
}

const getTourForAdminById = async(tourId) => {
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
        throw createError('Invalid tour ID', 400);
    }
    const tour = await Tour.findById(tourId);
    if(!tour){
        throw createError('Tour not found', 404);
    }

    return{
        message: 'Tour fetched successfully',
        success: true,
        tour,
    }
}

const editTour = async(tourId, tourUpdatedData) => {
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
        throw createError('Invalid tour ID', 400);
    }

    const allowedUpdates = [
        'title',
        'name',
        'description',
        'tourType',
        'country',
        'city',
        'meetingPoint',
        'mapLink',
        'startDateTime',
        'endDateTime',
        'capacity',
        'availableSeats',
        'pricePerPerson',
        'images',
        'includes',
        'isAvailable',
        'isFeatured',
        'isActive',
    ];

    const updates = {};

    for (const key of allowedUpdates) {
        if (tourUpdatedData[key] !== undefined) {
            updates[key] = tourUpdatedData[key];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw createError('No valid fields provided for update', 400);
    }

    if (updates.title !== undefined) {
        if (typeof updates.title !== 'string' || !updates.title.trim()) {
            throw createError('Title must be a non-empty string', 400);
        }
        updates.title = updates.title.trim();
    }

    if (updates.name !== undefined) {
        if (typeof updates.name !== 'string' || !updates.name.trim()) {
            throw createError('Tour name must be a non-empty string', 400);
        }

        const normalizedName = updates.name.trim();
        const escapedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existingTour = await Tour.findOne({
            _id: { $ne: tourId },
            name: { $regex: `^${escapedName}$`, $options: 'i' },
        });

        if (existingTour) {
            throw createError('Tour name is exist already!', 409);
        }

        updates.name = normalizedName;
    }

    if (updates.description !== undefined) {
        if (typeof updates.description !== 'string' || !updates.description.trim()) {
            throw createError('Description must be a non-empty string', 400);
        }
        updates.description = updates.description.trim();
    }

    const allowedTourTypes = [
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
    ];

    if (updates.tourType !== undefined) {
        if (
            typeof updates.tourType !== 'string' ||
            !allowedTourTypes.includes(updates.tourType.trim().toLowerCase())
        ) {
            throw createError('Invalid tour type', 400);
        }
        updates.tourType = updates.tourType.trim().toLowerCase();
    }

    if (updates.country !== undefined) {
        if (typeof updates.country !== 'string' || !updates.country.trim()) {
            throw createError('Country must be a non-empty string', 400);
        }
        updates.country = updates.country.trim();
    }

    if (updates.city !== undefined) {
        if (typeof updates.city !== 'string' || !updates.city.trim()) {
            throw createError('City must be a non-empty string', 400);
        }
        updates.city = updates.city.trim();
    }

    if (updates.meetingPoint !== undefined) {
        if (typeof updates.meetingPoint !== 'string' || !updates.meetingPoint.trim()) {
            throw createError('Meeting point must be a non-empty string', 400);
        }
        updates.meetingPoint = updates.meetingPoint.trim();
    }

    if (updates.mapLink !== undefined) {
        if (typeof updates.mapLink !== 'string' || !updates.mapLink.trim()) {
            throw createError('Map link must be a non-empty string', 400);
        }
        updates.mapLink = updates.mapLink.trim();
    }

    if (updates.startDateTime !== undefined) {
        const startDate = new Date(updates.startDateTime);

        if (isNaN(startDate.getTime())) {
            throw createError('Start date time must be a valid date', 400);
        }

        updates.startDateTime = startDate;
    }

    if (updates.endDateTime !== undefined) {
        const endDate = new Date(updates.endDateTime);

        if (isNaN(endDate.getTime())) {
            throw createError('End date time must be a valid date', 400);
        }

        updates.endDateTime = endDate;
    }

    if (updates.capacity !== undefined) {
        const capacityNumber = Number(updates.capacity);

        if (!Number.isInteger(capacityNumber) || capacityNumber < 1) {
            throw createError('Capacity must be an integer greater than or equal to 1', 400);
        }

        updates.capacity = capacityNumber;
    }

    if (updates.availableSeats !== undefined) {
        const availableSeatsNumber = Number(updates.availableSeats);

        if (!Number.isInteger(availableSeatsNumber) || availableSeatsNumber < 0) {
            throw createError('Available seats must be an integer greater than or equal to 0', 400);
        }

        updates.availableSeats = availableSeatsNumber;
    }

    if (updates.pricePerPerson !== undefined) {
        const pricePerPersonNumber = Number(updates.pricePerPerson);

        if (!Number.isFinite(pricePerPersonNumber) || pricePerPersonNumber < 0) {
            throw createError('Price per person must be a number greater than or equal to 0', 400);
        }

        updates.pricePerPerson = pricePerPersonNumber;
    }

    if (updates.images !== undefined) {
        if (!Array.isArray(updates.images)) {
            throw createError('Images must be an array', 400);
        }

        for (const image of updates.images) {
            if (typeof image !== 'string') {
                throw createError('Each image must be a string URL', 400);
            }
        }

        updates.images = updates.images.map((image) => image.trim()).filter(Boolean);
    }

    const allowedIncludes = [
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
    ];

    if (updates.includes !== undefined) {
        if (!Array.isArray(updates.includes)) {
            throw createError('Includes must be an array', 400);
        }

        for (const item of updates.includes) {
            if (typeof item !== 'string' || !allowedIncludes.includes(item.trim().toLowerCase())) {
                throw createError(`${item} is not a valid include option`, 400);
            }
        }

        updates.includes = updates.includes.map((item) => item.trim().toLowerCase()).filter(Boolean);
    }

    if (updates.isAvailable !== undefined && typeof updates.isAvailable !== 'boolean') {
        throw createError('isAvailable must be boolean', 400);
    }

    if (updates.isFeatured !== undefined && typeof updates.isFeatured !== 'boolean') {
        throw createError('isFeatured must be boolean', 400);
    }

    if (updates.isActive !== undefined && typeof updates.isActive !== 'boolean') {
        throw createError('isActive must be boolean', 400);
    }

    const currentTour = await Tour.findById(tourId);

    if (!currentTour) {
        throw createError('Tour not found', 404);
    }

    const effectiveStartDate = updates.startDateTime || currentTour.startDateTime;
    const effectiveEndDate = updates.endDateTime || currentTour.endDateTime;

    if (effectiveStartDate && effectiveEndDate && effectiveEndDate <= effectiveStartDate) {
        throw createError('End date time must be after start date time', 400);
    }

    if (updates.startDateTime !== undefined || updates.endDateTime !== undefined) {
        updates.durationHours = (effectiveEndDate - effectiveStartDate) / (1000 * 60 * 60);
    }

    const effectiveCapacity = updates.capacity !== undefined ? updates.capacity : currentTour.capacity;
    const effectiveAvailableSeats = updates.availableSeats !== undefined
        ? updates.availableSeats
        : currentTour.availableSeats;

    if (effectiveAvailableSeats > effectiveCapacity) {
        throw createError('Available seats cannot be greater than capacity', 400);
    }

    const tour = await Tour.findByIdAndUpdate(
        tourId,
        updates,
        {
            returnDocument: 'after',
            runValidators: true,
        }
    );

    return {
        message: 'Tour updated successfully',
        tour,
    };
}

const softDeleteTour = async(tourId) => {
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
        throw createError('Invalid tour ID', 400);
    }

    const tour = await Tour.findByIdAndUpdate(
        tourId,
        { isActive: false },
        {
            returnDocument: 'after',
            runValidators: true,
        }
    );

    if (!tour) {
        throw createError('Tour not found', 404);
    }

    return {
        message: 'Tour soft deleted successfully',
        tour,
    };
}

const restoreTour = async(tourId) => {
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
        throw createError('Invalid tour ID', 400);
    }

    const tour = await Tour.findByIdAndUpdate(
        tourId,
        { isActive: true },
        {
            returnDocument: 'after',
            runValidators: true,
        }
    );

    if (!tour) {
        throw createError('Tour not found', 404);
    }

    return {
        message: 'Tour restored successfully',
        tour,
    };
}

const hardDeleteTour = async(tourId) => {
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
        throw createError('Invalid tour ID', 400);
    }

    const tour = await Tour.findByIdAndDelete(tourId);

    if (!tour) {
        throw createError('Tour not found', 404);
    }

    return {
        message: 'Tour permanently deleted successfully',
        tour,
    };
}

const searchTours = async(queryParams) => {
    const {
        search,
        tourType,
        city,
        country,
        isAvailable,
        isFeatured,
        minPrice,
        maxPrice,
        minAvailableSeats,
        maxAvailableSeats,
        startDateFrom,
        startDateTo,
        includes,
        page = 1,
        limit = 10,
    } = queryParams;

    const filter = {
        isActive: true,
    };

    const allowedTourTypes = [
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
    ];

    if (tourType) {
        const normalizedTourType = tourType.trim().toLowerCase();

        if (!allowedTourTypes.includes(normalizedTourType)) {
            throw createError('Invalid tour type', 400);
        }

        filter.tourType = normalizedTourType;
    }

    if (city) {
        filter.city = { $regex: city, $options: 'i' };
    }

    if (country) {
        filter.country = { $regex: country, $options: 'i' };
    }

    if (isAvailable !== undefined) {
        filter.isAvailable = isAvailable === 'true';
    }

    if (isFeatured !== undefined) {
        filter.isFeatured = isFeatured === 'true';
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.pricePerPerson = {};

        if (minPrice !== undefined) {
            const parsedMinPrice = Number(minPrice);

            if (!Number.isFinite(parsedMinPrice) || parsedMinPrice < 0) {
                throw createError('Minimum price must be a number greater than or equal to 0', 400);
            }

            filter.pricePerPerson.$gte = parsedMinPrice;
        }

        if (maxPrice !== undefined) {
            const parsedMaxPrice = Number(maxPrice);

            if (!Number.isFinite(parsedMaxPrice) || parsedMaxPrice < 0) {
                throw createError('Maximum price must be a number greater than or equal to 0', 400);
            }

            filter.pricePerPerson.$lte = parsedMaxPrice;
        }
    }

    if (minAvailableSeats !== undefined || maxAvailableSeats !== undefined) {
        filter.availableSeats = {};

        if (minAvailableSeats !== undefined) {
            const parsedMinSeats = Number(minAvailableSeats);

            if (!Number.isInteger(parsedMinSeats) || parsedMinSeats < 0) {
                throw createError('Minimum available seats must be a number greater than or equal to 0', 400);
            }

            filter.availableSeats.$gte = parsedMinSeats;
        }

        if (maxAvailableSeats !== undefined) {
            const parsedMaxSeats = Number(maxAvailableSeats);

            if (!Number.isInteger(parsedMaxSeats) || parsedMaxSeats < 0) {
                throw createError('Maximum available seats must be a number greater than or equal to 0', 400);
            }

            filter.availableSeats.$lte = parsedMaxSeats;
        }
    }

    if (startDateFrom !== undefined || startDateTo !== undefined) {
        filter.startDateTime = {};

        if (startDateFrom !== undefined) {
            const parsedStartDateFrom = new Date(startDateFrom);

            if (isNaN(parsedStartDateFrom.getTime())) {
                throw createError('Start date from must be a valid date', 400);
            }

            filter.startDateTime.$gte = parsedStartDateFrom;
        }

        if (startDateTo !== undefined) {
            const parsedStartDateTo = new Date(startDateTo);

            if (isNaN(parsedStartDateTo.getTime())) {
                throw createError('Start date to must be a valid date', 400);
            }

            filter.startDateTime.$lte = parsedStartDateTo;
        }
    }

    if (includes !== undefined) {
        const allowedIncludes = [
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
        ];
        const includeItems = Array.isArray(includes)
            ? includes
            : String(includes).split(',');
        const normalizedIncludes = includeItems.map((item) => item.trim().toLowerCase()).filter(Boolean);

        for (const item of normalizedIncludes) {
            if (!allowedIncludes.includes(item)) {
                throw createError(`${item} is not a valid include option`, 400);
            }
        }

        if (normalizedIncludes.length > 0) {
            filter.includes = { $all: normalizedIncludes };
        }
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tourType: { $regex: search, $options: 'i' } },
            { country: { $regex: search, $options: 'i' } },
            { city: { $regex: search, $options: 'i' } },
            { meetingPoint: { $regex: search, $options: 'i' } },
        ];
    }

    const {
        page: currentPage,
        limit: pageLimit,
        skip,
    } = validatePagination({ page, limit });

    const tours = await Tour.find(filter)
        .select('-createdBy')
        .skip(skip)
        .limit(pageLimit);

    const totalTours = await Tour.countDocuments(filter);

    return {
        message: 'Tours search results fetched successfully',
        pagination: {
            currentPage,
            limit: pageLimit,
            totalTours,
            totalPages: Math.ceil(totalTours / pageLimit),
        },
        tours,
    };
}

const adminSearchTours = async(queryParams) => {
    const {
        search,
        isActive,
        page = 1,
        limit = 10,
    } = queryParams;

    const filter = {};

    if (isActive !== undefined) {
        if (!['true', 'false'].includes(String(isActive))) {
            throw createError('isActive must be true or false', 400);
        }

        filter.isActive = isActive === 'true';
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tourType: { $regex: search, $options: 'i' } },
            { country: { $regex: search, $options: 'i' } },
            { city: { $regex: search, $options: 'i' } },
            { meetingPoint: { $regex: search, $options: 'i' } },
        ];
    }

    const {
        page: currentPage,
        limit: pageLimit,
        skip,
    } = validatePagination({ page, limit });

    const tours = await Tour.find(filter)
        .skip(skip)
        .limit(pageLimit);

    const totalTours = await Tour.countDocuments(filter);

    return {
        message: 'Admin tours search results fetched successfully',
        pagination: {
            currentPage,
            limit: pageLimit,
            totalTours,
            totalPages: Math.ceil(totalTours / pageLimit),
        },
        tours,
    };
}

module.exports ={
    addTours,
    getAllTours,
    getTourById,
    getAllToursForAdmin,
    getTourForAdminById,
    editTour,
    softDeleteTour,
    restoreTour,
    hardDeleteTour,
    searchTours,
    adminSearchTours,
};
