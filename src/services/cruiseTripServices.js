const CruiseTrip = require('../models/CruiseTrip');
const mongoose = require('mongoose');

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

const addCruiseTrip = async(cruiseTripData,userId)=>{
    const{ title,
    name,
    description,
    cruiseType,
    country,
    city,
    marinaName,
    address,
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
  } = cruiseTripData;

  
   if (
    !title || !name || !description || !cruiseType || !country || !city || !marinaName || !address || !mapLink || !startDateTime || !endDateTime || capacity === undefined || availableSeats === undefined || pricePerPerson === undefined) {
    throw createError('All required fields must be provided', 400);
  }

  if (typeof title !== 'string' || !title.trim()) {
    throw createError('Title must be a non-empty string', 400);
  }

  if (typeof name !== 'string' || !name.trim()) {
    throw createError('Yacht or boat name must be a non-empty string', 400);
  }

  if (typeof description !== 'string' || !description.trim()) {
    throw createError('Description must be a non-empty string', 400);
  }

  const allowedCruiseTypes = ['yacht', 'cruise'];

  if (!allowedCruiseTypes.includes(cruiseType)) {
    throw createError('Cruise type must be yacht or cruise', 400);
  }

  if (typeof country !== 'string' || !country.trim()) {
    throw createError('Country must be a non-empty string', 400);
  }

  if (typeof city !== 'string' || !city.trim()) {
    throw createError('City must be a non-empty string', 400);
  }

  if (typeof marinaName !== 'string' || !marinaName.trim()) {
    throw createError('Marina name must be a non-empty string', 400);
  }

  if (typeof address !== 'string' || !address.trim()) {
    throw createError('Address must be a non-empty string', 400);
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

  if (!Number.isFinite(capacityNumber) || capacityNumber < 1) {
    throw createError('Capacity must be a number greater than or equal to 1', 400);
  }

  if (!Number.isFinite(availableSeatsNumber) || availableSeatsNumber < 0) {
    throw createError('Available seats must be a number greater than or equal to 0', 400);
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
    'lunch',
    'soft drinks',
    'snorkeling',
    'fishing',
    'life jacket',
    'tour guide',
    'hotel transfer',
    'music',
    'photography',
  ];

  if (includes !== undefined && !Array.isArray(includes)) {
    throw createError('Includes must be an array', 400);
  }

  if (includes !== undefined) {
    for (const item of includes) {
      if (!allowedIncludes.includes(item)) {
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

  const normalizedTitle = title.trim();
  const normalizedName = name.trim();
  const checkCruise = await CruiseTrip.findOne({ name: normalizedName });
  
  if(checkCruise){
    throw createError('This yacht or boat name is exist already!', 409);

  }

  
  const cruiseTrip = await CruiseTrip.create({
    title: normalizedTitle,
    name: normalizedName,
    description: description.trim(),
    cruiseType,
    country: country.trim(),
    city: city.trim(),
    marinaName: marinaName.trim(),
    address: address.trim(),
    mapLink: mapLink.trim(),
    startDateTime: startDate,
    endDateTime: endDate,
    capacity: capacityNumber,
    availableSeats: availableSeatsNumber,
    pricePerPerson: pricePerPersonNumber,
    images: images ? images.map((image) => image.trim()).filter(Boolean) : [],
    includes: includes || [],
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    isFeatured: isFeatured !== undefined ? isFeatured : false,
    isActive: isActive !== undefined ? isActive : true,
    createdBy: userId,
  })  
    return {
    message: 'CruiseTrip created successfully',
    cruiseTrip,
    };
};

const getAllCruiseTrips = async (queryParams)=>{

    const { page, limit, skip } = validatePagination(queryParams);

  const filter = {
    isActive: true,
  };

  const cruiseTrips = await CruiseTrip.find(filter);
  const totalCruiseTrips = await CruiseTrip.countDocuments(filter);

  return {
    message: 'Cruises fetched successfully',
    pagination: {
      currentPage: page,
      limit,
      totalCruiseTrips,
      totalPages: Math.ceil(totalCruiseTrips / limit),
    },
    cruiseTrips,
  };
};

const getAllCruisesTripsById = async(cruiseTripId)=>{

    if (!mongoose.Types.ObjectId.isValid(cruiseTripId)) {
        throw createError('Invalid cruise trip ID', 400);
    }

    const cruiseTrip = await CruiseTrip.findOne({
    _id: cruiseTripId,
    isActive: true,
  }).select('-createdBy');

  if (!cruiseTrip) {
    throw createError('Cruise not found', 404);
  }

  return {
    message: 'cruise trip fetched successfully',
    cruiseTrip,
  };

}
 
const getAllCruiseTripsForAdmin = async(queryParams)=> {
    const { page, limit, skip } = validatePagination(queryParams);
    
    const cruiseTrips = await CruiseTrip.find();

    const totalCruiseTrips = await CruiseTrip.countDocuments();

  return {
    message: 'Cruises fetched successfully',
    pagination: {
      currentPage: page,
      limit,
      totalCruiseTrips,
      totalPages: Math.ceil(totalCruiseTrips / limit),
    },
    cruiseTrips,
  };
}

const getAllCruiseTripsForAdminById = async(cruiseTripId)=>{
    if (!mongoose.Types.ObjectId.isValid(cruiseTripId)) {
        throw createError('Invalid cruise trip ID', 400);
    }

    const cruiseTrip = await CruiseTrip.findOne({
    _id: cruiseTripId,
  })

  if (!cruiseTrip) {
    throw createError('Cruise not found', 404);
  }

  return {
    message: 'cruise trip fetched successfully',
    cruiseTrip,
  };
}

const editCruiseTrip = async (cruiseTripUpdatedData, cruiseTripId) => {
  if (!mongoose.Types.ObjectId.isValid(cruiseTripId)) {
    throw createError('Invalid Cruise Trip ID', 400);
  }

  const allowedUpdates = [
    'title',
    'name',
    'description',
    'cruiseType',
    'country',
    'city',
    'marinaName',
    'address',
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
    if (cruiseTripUpdatedData[key] !== undefined) {
      updates[key] = cruiseTripUpdatedData[key];
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
      throw createError('Yacht or boat name must be a non-empty string', 400);
    }

    const normalizedName = updates.name.trim();
    const existingCruiseTrip = await CruiseTrip.findOne({
      _id: { $ne: cruiseTripId },
      name: normalizedName,
    });

    if (existingCruiseTrip) {
      throw createError('This yacht or boat name is exist already!', 409);
    }

    updates.name = normalizedName;
  }

  if (updates.description !== undefined) {
    if (typeof updates.description !== 'string' || !updates.description.trim()) {
      throw createError('Description must be a non-empty string', 400);
    }
    updates.description = updates.description.trim();
  }

  const allowedCruiseTypes = ['yacht', 'cruise'];

  if (updates.cruiseType !== undefined) {
    if (!allowedCruiseTypes.includes(updates.cruiseType)) {
      throw createError('Cruise type must be yacht or cruise', 400);
    }
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

  if (updates.marinaName !== undefined) {
    if (typeof updates.marinaName !== 'string' || !updates.marinaName.trim()) {
      throw createError('Marina name must be a non-empty string', 400);
    }
    updates.marinaName = updates.marinaName.trim();
  }

  if (updates.address !== undefined) {
    if (typeof updates.address !== 'string' || !updates.address.trim()) {
      throw createError('Address must be a non-empty string', 400);
    }
    updates.address = updates.address.trim();
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

    if (!Number.isFinite(capacityNumber) || capacityNumber < 1) {
      throw createError('Capacity must be a number greater than or equal to 1', 400);
    }

    updates.capacity = capacityNumber;
  }

  if (updates.availableSeats !== undefined) {
    const availableSeatsNumber = Number(updates.availableSeats);

    if (!Number.isFinite(availableSeatsNumber) || availableSeatsNumber < 0) {
      throw createError('Available seats must be a number greater than or equal to 0', 400);
    }

    updates.availableSeats = availableSeatsNumber;
  }

  if (
    updates.capacity !== undefined &&
    updates.availableSeats !== undefined &&
    updates.availableSeats > updates.capacity
  ) {
    throw createError('Available seats cannot be greater than capacity', 400);
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
    'lunch',
    'soft drinks',
    'snorkeling',
    'fishing',
    'life jacket',
    'tour guide',
    'hotel transfer',
    'music',
    'photography',
  ];

  if (updates.includes !== undefined) {
    if (!Array.isArray(updates.includes)) {
      throw createError('Includes must be an array', 400);
    }

    for (const item of updates.includes) {
      if (!allowedIncludes.includes(item)) {
        throw createError(`${item} is not a valid include option`, 400);
      }
    }
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

  const currentCruiseTrip = await CruiseTrip.findById(cruiseTripId);

  if (!currentCruiseTrip) {
    throw createError('Cruise not found', 404);
  }

  const effectiveStartDate = updates.startDateTime || currentCruiseTrip.startDateTime;
  const effectiveEndDate = updates.endDateTime || currentCruiseTrip.endDateTime;

  if (effectiveStartDate && effectiveEndDate && effectiveEndDate <= effectiveStartDate) {
    throw createError('End date time must be after start date time', 400);
  }

  if (updates.startDateTime !== undefined || updates.endDateTime !== undefined) {
    updates.durationHours = (effectiveEndDate - effectiveStartDate) / (1000 * 60 * 60);
  }

  const effectiveCapacity = updates.capacity !== undefined ? updates.capacity : currentCruiseTrip.capacity;
  const effectiveAvailableSeats = updates.availableSeats !== undefined
    ? updates.availableSeats
    : currentCruiseTrip.availableSeats;

  if (effectiveAvailableSeats > effectiveCapacity) {
    throw createError('Available seats cannot be greater than capacity', 400);
  }

  const cruiseTrip = await CruiseTrip.findByIdAndUpdate(
    cruiseTripId,
    updates,
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  return {
    message: 'CruiseTrip updated successfully',
    cruiseTrip,
  };
}

const softDeleteCruiseTrip = async(cruiseTripId)=>{
    if (!mongoose.Types.ObjectId.isValid(cruiseTripId)) {
        throw createError('Invalid Cruise Trip ID', 400);
    }
    const cruiseTrip = await CruiseTrip.findByIdAndUpdate(
    cruiseTripId,
    { isActive: false },
    {
      returnDocument: 'after',
      runValidators: true,
    }
    );

    if (!cruiseTrip) {
        throw createError('Cruise Trip not found', 404);
    }

    return {
        message: 'Cruise Trip soft deleted successfully',
        cruiseTrip,
  };
}

const restoreCruiseTrip = async(cruiseTripId)=>{
    if (!mongoose.Types.ObjectId.isValid(cruiseTripId)) {
        throw createError('Invalid Cruise Trip ID', 400);
    }

    const cruiseTrip = await CruiseTrip.findByIdAndUpdate(
    cruiseTripId,
    { isActive: true },
    {
      returnDocument: 'after',
      runValidators: true,
    }
    );

    if (!cruiseTrip) {
        throw createError('Cruise Trip not found', 404);
    }

    return {
        message: 'Cruise Trip restored successfully',
        cruiseTrip,
  };
}

const hardDeleteCruiseTrip = async(cruiseTripId)=>{
    if (!mongoose.Types.ObjectId.isValid(cruiseTripId)) {
        throw createError('Invalid Cruise Trip ID', 400);
    }

    const cruiseTrip = await CruiseTrip.findByIdAndDelete(cruiseTripId);

    if (!cruiseTrip) {
        throw createError('Cruise Trip not found', 404);
    }

    return {
        message: 'Cruise Trip permanently deleted successfully',
        cruiseTrip,
  };
}

const searchCruiseTrips = async (queryParams) => {
  const {
    search,
    cruiseType,
    city,
    country,
    marinaName,
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

  if (cruiseType) {
    const normalizedCruiseType = cruiseType.trim().toLowerCase();
    const allowedCruiseTypes = ['yacht', 'cruise'];

    if (!allowedCruiseTypes.includes(normalizedCruiseType)) {
      throw createError('Cruise type must be yacht or cruise', 400);
    }

    filter.cruiseType = normalizedCruiseType;
  }

  if (city) {
    filter.city = { $regex: city, $options: 'i' };
  }

  if (country) {
    filter.country = { $regex: country, $options: 'i' };
  }

  if (marinaName) {
    filter.marinaName = { $regex: marinaName, $options: 'i' };
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
      'lunch',
      'soft drinks',
      'snorkeling',
      'fishing',
      'life jacket',
      'tour guide',
      'hotel transfer',
      'music',
      'photography',
    ];
    const includeItems = Array.isArray(includes)
      ? includes
      : String(includes).split(',');
    const normalizedIncludes = includeItems.map((item) => item.trim()).filter(Boolean);

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
      { city: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } },
      { marinaName: { $regex: search, $options: 'i' } },
    ];
  }

  const {
    page: currentPage,
    limit: pageLimit,
    skip,
  } = validatePagination({ page, limit });

  const cruiseTrips = await CruiseTrip.find(filter)
    .select('-createdBy')
    .skip(skip)
    .limit(pageLimit);

  const totalCruiseTrips = await CruiseTrip.countDocuments(filter);

  return {
    message: 'Cruise trips search results fetched successfully',
    pagination: {
      currentPage,
      limit: pageLimit,
      totalCruiseTrips,
      totalPages: Math.ceil(totalCruiseTrips / pageLimit),
    },
    cruiseTrips,
  };
};

const adminSearchCruiseTrips = async (queryParams) => {
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
      { cruiseType: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } },
      { marinaName: { $regex: search, $options: 'i' } },
    ];
  }

  const {
    page: currentPage,
    limit: pageLimit,
    skip,
  } = validatePagination({ page, limit });

  const cruiseTrips = await CruiseTrip.find(filter)
    .skip(skip)
    .limit(pageLimit);

  const totalCruiseTrips = await CruiseTrip.countDocuments(filter);

  return {
    message: 'Admin cruise trips search results fetched successfully',
    pagination: {
      currentPage,
      limit: pageLimit,
      totalCruiseTrips,
      totalPages: Math.ceil(totalCruiseTrips / pageLimit),
    },
    cruiseTrips,
  };
};

module.exports ={
    addCruiseTrip,
    getAllCruiseTrips,
    getAllCruisesTripsById,
    getAllCruiseTripsForAdmin,
    getAllCruiseTripsForAdminById,
    editCruiseTrip,
    softDeleteCruiseTrip,
    restoreCruiseTrip,
    hardDeleteCruiseTrip,
    searchCruiseTrips,
    adminSearchCruiseTrips,
};
