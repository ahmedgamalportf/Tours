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



module.exports ={
    addCruiseTrip,
};
