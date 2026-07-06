const Hotel = require('../models/Hotel');
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

const addHotel= async(hotelData,userId)=>{
    const {name,
    description,
    country,
    city,
    address,
    location,
    images,
    roomsAvailable,
    isFeatured,
    isActive,
    stars,} = hotelData;
    
    if (!name || !description || !country || !city || !address || !location || stars === undefined || roomsAvailable === undefined) {
        throw createError('All required fields must be provided', 400);
    }

    if (typeof name !== 'string' || !name.trim()) {
        throw createError('Hotel name is required', 400);
    }

    if (typeof description !== 'string' || !description.trim()) {
        throw createError('Description is required', 400);
    }

    if (typeof country !== 'string' || !country.trim()) {
        throw createError('Country is required', 400);
    }

    if (typeof city !== 'string' || !city.trim()) {
        throw createError('City is required', 400);
    }

    if (typeof address !== 'string' || !address.trim()) {
        throw createError('Address is required', 400);
    }

    if (typeof location !== 'string' || !location.trim()) {
        throw createError('Location link is required', 400);
    }

    if (typeof stars !== 'number' || stars < 1 || stars > 5) {
        throw createError('Stars must be a number between 1 and 5', 400);
    }

    if (typeof roomsAvailable !== 'number' || roomsAvailable < 0) {
        throw createError('Rooms available must be a number greater than or equal to 0', 400);
    }

    if (images !== undefined && !Array.isArray(images)) {
        throw createError('Images must be an array', 400);
    }

    if (isFeatured !== undefined && typeof isFeatured !== 'boolean') {
        throw createError('isFeatured must be boolean', 400);
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
        throw createError('isActive must be boolean', 400);
    }

    const hotel = await Hotel.create({
        name: name.trim(),
        description: description.trim(),
        country: country.trim(),
        city: city.trim(),
        address: address.trim(),
        location: location.trim(),
        images: images || [],
        roomsAvailable,
        isFeatured: isFeatured || false,
        isActive: isActive !== undefined ? isActive : true,
        stars,
        createdBy: userId
    })
    
    return {
        message: 'hotel created successfully',
        hotel,
    };
};

const gethotels = async (queryParams) => {
  const { page, limit, skip } = validatePagination(queryParams);

  const filter = {
    isActive: true,
  };

  const hotels = await Hotel.find(filter)
    .select('-createdBy')
    .skip(skip)
    .limit(limit);

  const totalHotels = await Hotel.countDocuments(filter);

  return {
    message: 'hotel fetched successfully',
    pagination: {
      currentPage: page,
      limit,
      totalHotels,
      totalPages: Math.ceil(totalHotels / limit),
    },
    hotels,
  };
};



const gethotelsForadmin = async (queryParams) => {
  const { page, limit, skip } = validatePagination(queryParams);

  const hotels = await Hotel.find()
    .populate('createdBy', 'firstName lastName email role')
    .skip(skip)
    .limit(limit);

  const totalHotels = await Hotel.countDocuments();

  return {
    message: 'hotels fetched successfully',
    pagination: {
      currentPage: page,
      limit,
      totalHotels,
      totalPages: Math.ceil(totalHotels / limit),
    },
    hotels,
  };
};

const getHotelById = async (hotelId) => {
  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    throw createError('Invalid hotel ID', 400);
  }

  const hotel = await Hotel.findOne({
    _id: hotelId,
    isActive: true,
  }).select('-createdBy');

  if (!hotel) {
    throw createError('Hotel not found', 404);
  }

  return {
    message: 'Hotel fetched successfully',
    hotel,
  };
};

const getHotelByIdForAdmin = async (hotelId) => {
  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    throw createError('Invalid hotel ID', 400);
  }

  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    throw createError('Hotel not found', 404);
  }

  return {
    message: 'Hotel fetched successfully',
    hotel,
  };
};


const editHotel = async (hotelId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    throw createError('Invalid hotel ID', 400);
  }

  const allowedUpdates = [
    'name',
    'description',
    'country',
    'city',
    'address',
    'location',
    'images',
    'roomsAvailable',
    'isFeatured',
    'isActive',
    'stars',
  ];

  const updates = {};

  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      updates[key] = updateData[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw createError('No valid fields provided for update', 400);
  }

  if (updates.name !== undefined) {
    if (typeof updates.name !== 'string' || !updates.name.trim()) {
      throw createError('Hotel name must be a non-empty string', 400);
    }
    updates.name = updates.name.trim();
  }

  if (updates.description !== undefined) {
    if (typeof updates.description !== 'string' || !updates.description.trim()) {
      throw createError('Description must be a non-empty string', 400);
    }
    updates.description = updates.description.trim();
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

  if (updates.address !== undefined) {
    if (typeof updates.address !== 'string' || !updates.address.trim()) {
      throw createError('Address must be a non-empty string', 400);
    }
    updates.address = updates.address.trim();
  }

  if (updates.location !== undefined) {
    if (typeof updates.location !== 'string' || !updates.location.trim()) {
      throw createError('Location link must be a non-empty string', 400);
    }
    updates.location = updates.location.trim();
  }

  if (updates.stars !== undefined) {
    if (typeof updates.stars !== 'number' || updates.stars < 1 || updates.stars > 5) {
      throw createError('Stars must be a number between 1 and 5', 400);
    }
  }

  if (updates.roomsAvailable !== undefined) {
    if (typeof updates.roomsAvailable !== 'number' || updates.roomsAvailable < 0) {
      throw createError('Rooms available must be a number greater than or equal to 0', 400);
    }
  }

  if (updates.images !== undefined && !Array.isArray(updates.images)) {
    throw createError('Images must be an array', 400);
  }

  if (updates.isFeatured !== undefined && typeof updates.isFeatured !== 'boolean') {
    throw createError('isFeatured must be boolean', 400);
  }

  if (updates.isActive !== undefined && typeof updates.isActive !== 'boolean') {
    throw createError('isActive must be boolean', 400);
  }

  const hotel = await Hotel.findByIdAndUpdate(
    hotelId,
    updates,
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  if (!hotel) {
    throw createError('Hotel not found', 404);
  }

  return {
    message: 'Hotel updated successfully',
    hotel,
  };
};

const softDeleteHotel = async (hotelId) => {
  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    throw createError('Invalid hotel ID', 400);
  }

  const hotel = await Hotel.findByIdAndUpdate(
    hotelId,
    { isActive: false },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  if (!hotel) {
    throw createError('Hotel not found', 404);
  }

  return {
    message: 'Hotel soft deleted successfully',
    hotel,
  };
};

const restoreHotel = async (hotelId) => {
  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    throw createError('Invalid hotel ID', 400);
  }

  const hotel = await Hotel.findByIdAndUpdate(
    hotelId,
    { isActive: true },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  if (!hotel) {
    throw createError('Hotel not found', 404);
  }

  return {
    message: 'Hotel restored successfully',
    hotel,
  };
};

const hardDeleteHotel = async (hotelId) => {
  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    throw createError('Invalid hotel ID', 400);
  }

  const hotel = await Hotel.findByIdAndDelete(hotelId);

  if (!hotel) {
    throw createError('Hotel not found', 404);
  }

  return {
    message: 'Hotel permanently deleted successfully',
    hotel,
  };
};

const searchHotels = async (queryParams) => {
  const {
    search,
    city,
    country,
    stars,
    isFeatured,
    page = 1,
    limit = 10,
  } = queryParams;

  const filter = {
    isActive: true,
  };

  if (city) {
    filter.city = { $regex: city, $options: 'i' };
  }

  if (country) {
    filter.country = { $regex: country, $options: 'i' };
  }

  if (stars !== undefined) {
    const parsedStars = Number(stars);

    if (!Number.isFinite(parsedStars) || parsedStars < 1 || parsedStars > 5) {
      throw createError('Stars must be a number between 1 and 5', 400);
    }

    filter.stars = parsedStars;
  }

  if (isFeatured !== undefined) {
    filter.isFeatured = isFeatured === 'true';
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } },
    ];
  }

  const {
    page: currentPage,
    limit: pageLimit,
    skip,
  } = validatePagination({ page, limit });

  const hotels = await Hotel.find(filter)
    .select('-createdBy')
    .skip(skip)
    .limit(pageLimit);

  const totalHotels = await Hotel.countDocuments(filter);

  return {
    message: 'Hotels search results fetched successfully',
    pagination: {
      currentPage,
      limit: pageLimit,
      totalHotels,
      totalPages: Math.ceil(totalHotels / pageLimit),
    },
    hotels,
  };
};

module.exports = {
  addHotel,
  gethotels,
  gethotelsForadmin,
  getHotelById,
  getHotelByIdForAdmin,
  editHotel,
  softDeleteHotel,
  restoreHotel,
  hardDeleteHotel,
  searchHotels,
};
