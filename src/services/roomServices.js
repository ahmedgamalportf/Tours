const Room = require('../models/Room');
const Hotel = require('../models/Hotel')
const mongoose = require ('mongoose');


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

const addRoom = async (roomData, userId, hotelId) => {
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

  const roomExists = await Room.findOne({
    hotel: hotelId,
    roomName: roomName.trim(),
    isActive: true,
  });

  if (roomExists) {
    throw createError('Room name already exists in this hotel', 409);
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

const getRoom = async(queryParams)=>{
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

module.exports = {
    addRoom,
    getRoom,
    getRoomById,
};
