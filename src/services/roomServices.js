const Room = require('../models/Room');
const Hotel = require('../models/Hotel')
const mongoose = require ('mongoose');


const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeObjectId = (id) => String(id || '').trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

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

const addRoom = async (roomData, userId, hotelId) => {
  hotelId = normalizeObjectId(hotelId);
  userId = normalizeObjectId(userId);

  const {
    roomName,
    roomType,
    description,
    pricePerNight,
    capacity,
    totalRooms,
    availableRooms,
    isAvailable,
    isActive,
  } = roomData;

  if (!hotelId) {
    throw createError('Hotel ID is required', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    throw createError('Invalid hotel ID', 400);
  }

  if (!userId) {
    throw createError('Authenticated user is required', 401);
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createError('Invalid user ID', 400);
  }

  const hotelExists = await Hotel.findOne({
    _id: hotelId,
    isActive: true,
  });

  if (!hotelExists) {
    throw createError('Hotel not found', 404);
  }

  if (
    !roomName ||
    !roomType ||
    pricePerNight === undefined ||
    !capacity ||
    totalRooms === undefined ||
    availableRooms === undefined
  ) {
    throw createError('All required fields must be provided', 400);
  }

  if (typeof roomName !== 'string' || !roomName.trim()) {
    throw createError('Room name is required', 400);
  }

  if (typeof roomType !== 'string' || !roomType.trim()) {
    throw createError('Room type is required', 400);
  }

  const allowedRoomTypes = ['single', 'double', 'triple', 'suite', 'deluxe', 'family'];

  if (!allowedRoomTypes.includes(roomType.trim().toLowerCase())) {
    throw createError('Invalid room type', 400);
  }

  if (description !== undefined && typeof description !== 'string') {
    throw createError('Description must be a string', 400);
  }

  if (typeof pricePerNight !== 'number' || pricePerNight < 0) {
    throw createError('Price per night must be a number greater than or equal to 0', 400);
  }

  if (typeof totalRooms !== 'number' || totalRooms < 1) {
    throw createError('Total rooms must be a number greater than or equal to 1', 400);
  }

  if (typeof availableRooms !== 'number' || availableRooms < 0) {
    throw createError('Available rooms must be a number greater than or equal to 0', 400);
  }

  if (availableRooms > totalRooms) {
    throw createError('Available rooms cannot be greater than total rooms', 400);
  }

  if (typeof capacity !== 'object' || capacity === null) {
    throw createError('Capacity must be an object', 400);
  }

  if (typeof capacity.adults !== 'number' || capacity.adults < 1) {
    throw createError('Adults capacity must be a number greater than or equal to 1', 400);
  }

  if (
    capacity.children !== undefined &&
    (typeof capacity.children !== 'number' || capacity.children < 0)
  ) {
    throw createError('Children capacity must be a number greater than or equal to 0', 400);
  }

  if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
    throw createError('isAvailable must be boolean', 400);
  }

  if (isActive !== undefined && typeof isActive !== 'boolean') {
    throw createError('isActive must be boolean', 400);
  }

  const room = await Room.create({
    hotel: hotelId,
    createdBy: userId,
    roomName: roomName.trim(),
    roomType: roomType.trim().toLowerCase(),
    description: description ? description.trim() : undefined,
    pricePerNight,
    capacity: {
      adults: capacity.adults,
      children: capacity.children || 0,
    },
    totalRooms,
    availableRooms,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    isActive: isActive !== undefined ? isActive : true,
  });

  return {
    message: 'Room created successfully',
    room,
  };
};

const getRooms = async(queryParams)=>{
    const { page, limit, skip } = validatePagination(queryParams);

    const filter = {
      isActive: true,
    };

    const rooms = await Room.find(filter)
      .select('-createdBy')
      .skip(skip)
      .limit(limit);

    const totalRooms = await Room.countDocuments(filter);

    return {
    message: 'Room fetched successfully',
    pagination: {
      currentPage: page,
      limit,
      totalRooms,
      totalPages: Math.ceil(totalRooms / limit),
    },
    rooms,
  };
}

const getRoomById = async(roomId)=>{
    roomId = normalizeObjectId(roomId);

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
        throw createError('Invalid Room ID', 400);
    }

    const room = await Room.findOne({
        _id: roomId,
    isActive: true,
  }).select('-createdBy');

  if (!room) {
    throw createError('Room not found', 404);
  }

  return {
    message: 'Room fetched successfully',
    room,
  };
}

const getRoomByIdForAdmin = async(roomId)=>{
    roomId = normalizeObjectId(roomId);

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
        throw createError('Invalid Room ID', 400);
    }

    const room = await Room.findById(roomId);

    if(!room){
        throw createError('Room not found', 404);
    }

    return{
        message: 'room fetched successfully',
        room,
    }

}

const editRoom = async(roomId, updateData)=>{
    roomId = normalizeObjectId(roomId);

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
        throw createError('Invalid Room ID', 400);
  }

  const allowedUpdates = [
    'hotel',
    'roomName',
    'roomType',
    'description',
    'pricePerNight',
    'capacity',
    'totalRooms',
    'availableRooms',
    'isAvailable',
    'isActive',
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

  if (updates.hotel !== undefined) {
    updates.hotel = normalizeObjectId(updates.hotel);

    if (!mongoose.Types.ObjectId.isValid(updates.hotel)) {
      throw createError('Invalid hotel ID', 400);
    }

    const hotelExists = await Hotel.findOne({
      _id: updates.hotel,
      isActive: true,
    });

    if (!hotelExists) {
      throw createError('Hotel not found', 404);
    }
  }

  if (updates.roomName !== undefined) {
    if (typeof updates.roomName !== 'string' || !updates.roomName.trim()) {
      throw createError('Room name must be a non-empty string', 400);
    }
    updates.roomName = updates.roomName.trim();
  }

  if (updates.roomType !== undefined) {
    if (typeof updates.roomType !== 'string' || !updates.roomType.trim()) {
      throw createError('Room type must be a non-empty string', 400);
    }

    const allowedRoomTypes = ['single', 'double', 'triple', 'suite', 'deluxe', 'family'];

    if (!allowedRoomTypes.includes(updates.roomType.trim().toLowerCase())) {
      throw createError('Invalid room type', 400);
    }

    updates.roomType = updates.roomType.trim().toLowerCase();
  }

  if (updates.description !== undefined) {
    if (typeof updates.description !== 'string') {
      throw createError('Description must be a string', 400);
    }
    updates.description = updates.description.trim();
  }

  if (updates.pricePerNight !== undefined) {
    if (typeof updates.pricePerNight !== 'number' || updates.pricePerNight < 0) {
      throw createError('Price per night must be a number greater than or equal to 0', 400);
    }
  }

  if (updates.totalRooms !== undefined) {
    if (typeof updates.totalRooms !== 'number' || updates.totalRooms < 1) {
      throw createError('Total rooms must be a number greater than or equal to 1', 400);
    }
  }

  if (updates.availableRooms !== undefined) {
    if (typeof updates.availableRooms !== 'number' || updates.availableRooms < 0) {
      throw createError('Available rooms must be a number greater than or equal to 0', 400);
    }
  }

  if (
    updates.totalRooms !== undefined &&
    updates.availableRooms !== undefined &&
    updates.availableRooms > updates.totalRooms
  ) {
    throw createError('Available rooms cannot be greater than total rooms', 400);
  }

  if (updates.capacity !== undefined) {
    if (typeof updates.capacity !== 'object' || updates.capacity === null) {
      throw createError('Capacity must be an object', 400);
    }

    if (typeof updates.capacity.adults !== 'number' || updates.capacity.adults < 1) {
      throw createError('Adults capacity must be a number greater than or equal to 1', 400);
    }

    if (
      updates.capacity.children !== undefined &&
      (typeof updates.capacity.children !== 'number' || updates.capacity.children < 0)
    ) {
      throw createError('Children capacity must be a number greater than or equal to 0', 400);
    }

    updates.capacity = {
      adults: updates.capacity.adults,
      children: updates.capacity.children || 0,
    };
  }

  if (updates.isAvailable !== undefined && typeof updates.isAvailable !== 'boolean') {
    throw createError('isAvailable must be boolean', 400);
  }

  if (updates.isActive !== undefined && typeof updates.isActive !== 'boolean') {
    throw createError('isActive must be boolean', 400);
  }

  const existingRoom = await Room.findById(roomId);

  if (!existingRoom) {
    throw createError('Room not found', 404);
  }

  const nextTotalRooms = updates.totalRooms !== undefined ? updates.totalRooms : existingRoom.totalRooms;
  const nextAvailableRooms = updates.availableRooms !== undefined ? updates.availableRooms : existingRoom.availableRooms;

  if (nextAvailableRooms > nextTotalRooms) {
    throw createError('Available rooms cannot be greater than total rooms', 400);
  }

  const room = await Room.findByIdAndUpdate(
    roomId,
    updates,
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  return {
    message: 'Room updated successfully',
    room,
  };


}

const softDeleteRoom = async (roomId) => {
  roomId = normalizeObjectId(roomId);

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw createError('Invalid Room ID', 400);
  }

  const room = await Room.findByIdAndUpdate(
    roomId,
    { isActive: false },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  if (!room) {
    throw createError('Room not found', 404);
  }

  return {
    message: 'Room soft deleted successfully',
    room,
  };
};

const restoreRoom = async (roomId) => {
  roomId = normalizeObjectId(roomId);

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw createError('Invalid Room ID', 400);
  }

  const room = await Room.findByIdAndUpdate(
    roomId,
    { isActive: true },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  if (!room) {
    throw createError('Room not found', 404);
  }

  return {
    message: 'Room restored successfully',
    room,
  };
};

const hardDeleteRoom = async (roomId) => {
  roomId = normalizeObjectId(roomId);

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw createError('Invalid Room ID', 400);
  }

  const room = await Room.findByIdAndDelete(roomId);

  if (!room) {
    throw createError('Room not found', 404);
  }

  return {
    message: 'Room permanently deleted successfully',
    room,
  };
};

const searchRooms = async (queryParams) => {
  const {
    search,
    hotel,
    roomType,
    minPrice,
    maxPrice,
    adults,
    children,
    isAvailable,
    page = 1,
    limit = 10,
  } = queryParams;

  const filter = {
    isActive: true,
  };

  if (hotel) {
    const hotelId = normalizeObjectId(hotel);

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      throw createError('Invalid hotel ID', 400);
    }

    filter.hotel = hotelId;
  }

  if (roomType) {
    const normalizedRoomType = roomType.trim().toLowerCase();
    const allowedRoomTypes = ['single', 'double', 'triple', 'suite', 'deluxe', 'family'];

    if (!allowedRoomTypes.includes(normalizedRoomType)) {
      throw createError('Invalid room type', 400);
    }

    filter.roomType = normalizedRoomType;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.pricePerNight = {};

    if (minPrice !== undefined) {
      const parsedMinPrice = Number(minPrice);

      if (!Number.isFinite(parsedMinPrice) || parsedMinPrice < 0) {
        throw createError('Minimum price must be a number greater than or equal to 0', 400);
      }

      filter.pricePerNight.$gte = parsedMinPrice;
    }

    if (maxPrice !== undefined) {
      const parsedMaxPrice = Number(maxPrice);

      if (!Number.isFinite(parsedMaxPrice) || parsedMaxPrice < 0) {
        throw createError('Maximum price must be a number greater than or equal to 0', 400);
      }

      filter.pricePerNight.$lte = parsedMaxPrice;
    }
  }

  if (adults !== undefined) {
    const parsedAdults = Number(adults);

    if (!Number.isInteger(parsedAdults) || parsedAdults < 1) {
      throw createError('Adults must be a positive integer', 400);
    }

    filter['capacity.adults'] = { $gte: parsedAdults };
  }

  if (children !== undefined) {
    const parsedChildren = Number(children);

    if (!Number.isInteger(parsedChildren) || parsedChildren < 0) {
      throw createError('Children must be a number greater than or equal to 0', 400);
    }

    filter['capacity.children'] = { $gte: parsedChildren };
  }

  if (isAvailable !== undefined) {
    filter.isAvailable = isAvailable === 'true';
  }

  if (search) {
    filter.$or = [
      { roomName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const {
    page: currentPage,
    limit: pageLimit,
    skip,
  } = validatePagination({ page, limit });

  const rooms = await Room.find(filter)
    .select('-createdBy')
    .populate('hotel', 'name city country')
    .skip(skip)
    .limit(pageLimit);

  const totalRooms = await Room.countDocuments(filter);

  return {
    message: 'Rooms search results fetched successfully',
    pagination: {
      currentPage,
      limit: pageLimit,
      totalRooms,
      totalPages: Math.ceil(totalRooms / pageLimit),
    },
    rooms,
  };
};



module.exports = {
    addRoom,
    getRooms,
    getRoomById,
    getRoomByIdForAdmin,
    editRoom,
    softDeleteRoom,
    restoreRoom,
    hardDeleteRoom,
    searchRooms,
};
