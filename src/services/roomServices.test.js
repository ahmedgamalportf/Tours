jest.mock('../models/Room', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
}));

jest.mock('../models/Hotel', () => ({
  findOne: jest.fn(),
}));

const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const roomServices = require('./roomServices');

const roomId = '507f1f77bcf86cd799439011';
const hotelId = '507f1f77bcf86cd799439012';
const userId = '507f1f77bcf86cd799439013';

describe('roomServices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects invalid pagination values', async () => {
    await expect(roomServices.getRooms({ page: '-1' })).rejects.toThrow('Page must be a positive integer');
    await expect(roomServices.getRooms({ limit: '-10' })).rejects.toThrow('Limit must be a positive integer between 1 and 50');
    await expect(roomServices.getRooms({ page: 'abc' })).rejects.toThrow('Page must be a positive integer');
    await expect(roomServices.getRooms({ limit: 'abc' })).rejects.toThrow('Limit must be a positive integer between 1 and 50');
  });

  test('creates a room with validated hotel and user ids', async () => {
    const roomData = {
      roomName: 'Sea View Suite',
      roomType: 'Suite',
      description: 'Large suite',
      pricePerNight: 250,
      capacity: {
        adults: 2,
        children: 1,
      },
      totalRooms: 10,
      availableRooms: 7,
      isAvailable: true,
    };

    Hotel.findOne.mockResolvedValue({ _id: hotelId });
    Room.create.mockResolvedValue({ _id: roomId, ...roomData });

    const result = await roomServices.addRoom(roomData, userId, hotelId);

    expect(Hotel.findOne).toHaveBeenCalledWith({
      _id: hotelId,
      isActive: true,
    });
    expect(Room.create).toHaveBeenCalledWith({
      hotel: hotelId,
      createdBy: userId,
      roomName: 'Sea View Suite',
      roomType: 'suite',
      description: 'Large suite',
      pricePerNight: 250,
      capacity: {
        adults: 2,
        children: 1,
      },
      totalRooms: 10,
      availableRooms: 7,
      isAvailable: true,
      isActive: true,
    });
    expect(result.message).toBe('Room created successfully');
  });

  test('rejects edit when availableRooms would exceed totalRooms', async () => {
    Room.findById.mockResolvedValue({
      _id: roomId,
      totalRooms: 5,
      availableRooms: 2,
    });

    await expect(roomServices.editRoom(roomId, { availableRooms: 6 })).rejects.toThrow(
      'Available rooms cannot be greater than total rooms'
    );
  });

  test('soft deletes a room', async () => {
    Room.findByIdAndUpdate.mockResolvedValue({ _id: roomId, isActive: false });

    const result = await roomServices.softDeleteRoom(roomId);

    expect(Room.findByIdAndUpdate).toHaveBeenCalledWith(
      roomId,
      { isActive: false },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );
    expect(result.message).toBe('Room soft deleted successfully');
  });

  test('restores a room', async () => {
    Room.findByIdAndUpdate.mockResolvedValue({ _id: roomId, isActive: true });

    const result = await roomServices.restoreRoom(roomId);

    expect(Room.findByIdAndUpdate).toHaveBeenCalledWith(
      roomId,
      { isActive: true },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );
    expect(result.message).toBe('Room restored successfully');
  });

  test('hard deletes a room', async () => {
    Room.findByIdAndDelete.mockResolvedValue({ _id: roomId });

    const result = await roomServices.hardDeleteRoom(roomId);

    expect(Room.findByIdAndDelete).toHaveBeenCalledWith(roomId);
    expect(result.message).toBe('Room permanently deleted successfully');
  });

  test('searches rooms with filters', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const skip = jest.fn(() => ({ limit }));
    const populate = jest.fn(() => ({ skip }));
    const select = jest.fn(() => ({ populate }));

    Room.find.mockReturnValue({ select });
    Room.countDocuments.mockResolvedValue(0);

    const result = await roomServices.searchRooms({
      search: 'sea',
      hotel: hotelId,
      roomType: 'Suite',
      minPrice: '100',
      maxPrice: '500',
      adults: '2',
      children: '1',
      isAvailable: 'true',
    });

    expect(Room.find).toHaveBeenCalledWith({
      isActive: true,
      hotel: hotelId,
      roomType: 'suite',
      pricePerNight: {
        $gte: 100,
        $lte: 500,
      },
      'capacity.adults': { $gte: 2 },
      'capacity.children': { $gte: 1 },
      isAvailable: true,
      $or: [
        { roomName: { $regex: 'sea', $options: 'i' } },
        { description: { $regex: 'sea', $options: 'i' } },
      ],
    });
    expect(select).toHaveBeenCalledWith('-createdBy');
    expect(populate).toHaveBeenCalledWith('hotel', 'name city country');
    expect(result.rooms).toEqual([]);
  });

  test('rejects invalid room search filters', async () => {
    await expect(roomServices.searchRooms({ hotel: 'bad-id' })).rejects.toThrow('Invalid hotel ID');
    await expect(roomServices.searchRooms({ roomType: 'castle' })).rejects.toThrow('Invalid room type');
    await expect(roomServices.searchRooms({ minPrice: '-1' })).rejects.toThrow(
      'Minimum price must be a number greater than or equal to 0'
    );
    await expect(roomServices.searchRooms({ adults: '0' })).rejects.toThrow('Adults must be a positive integer');
  });
});
