jest.mock('../models/Hotel', () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
}));

const Hotel = require('../models/Hotel');
const hotelServices = require('./hotelServices');

describe('hotelServices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects invalid pagination values', async () => {
    await expect(hotelServices.gethotels({ page: '-1' })).rejects.toThrow('Page must be a positive integer');
    await expect(hotelServices.gethotels({ limit: '-10' })).rejects.toThrow('Limit must be a positive integer between 1 and 50');
    await expect(hotelServices.gethotels({ page: 'abc' })).rejects.toThrow('Page must be a positive integer');
    await expect(hotelServices.gethotels({ limit: 'abc' })).rejects.toThrow('Limit must be a positive integer between 1 and 50');
  });

  test('public hotel details do not expose createdBy', async () => {
    const select = jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'Sea View Hotel',
    });

    Hotel.findOne.mockReturnValue({ select });

    const result = await hotelServices.getHotelById('507f1f77bcf86cd799439011');

    expect(Hotel.findOne).toHaveBeenCalledWith({
      _id: '507f1f77bcf86cd799439011',
      isActive: true,
    });
    expect(select).toHaveBeenCalledWith('-createdBy');
    expect(result.hotel).not.toHaveProperty('createdBy');
  });

  test('searches hotels with rooms available filters', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const skip = jest.fn(() => ({ limit }));
    const select = jest.fn(() => ({ skip }));

    Hotel.find.mockReturnValue({ select });
    Hotel.countDocuments.mockResolvedValue(0);

    const result = await hotelServices.searchHotels({
      search: 'sea',
      city: 'Hurghada',
      stars: '5',
      minRoomsAvailable: '5',
      maxRoomsAvailable: '20',
    });

    expect(Hotel.find).toHaveBeenCalledWith({
      isActive: true,
      city: { $regex: 'Hurghada', $options: 'i' },
      stars: 5,
      roomsAvailable: {
        $gte: 5,
        $lte: 20,
      },
      $or: [
        { name: { $regex: 'sea', $options: 'i' } },
        { description: { $regex: 'sea', $options: 'i' } },
        { city: { $regex: 'sea', $options: 'i' } },
        { country: { $regex: 'sea', $options: 'i' } },
      ],
    });
    expect(select).toHaveBeenCalledWith('-createdBy');
    expect(result.hotels).toEqual([]);
  });

  test('rejects invalid rooms available filters', async () => {
    await expect(hotelServices.searchHotels({ minRoomsAvailable: '-1' })).rejects.toThrow(
      'Minimum rooms available must be a number greater than or equal to 0'
    );
    await expect(hotelServices.searchHotels({ maxRoomsAvailable: 'abc' })).rejects.toThrow(
      'Maximum rooms available must be a number greater than or equal to 0'
    );
  });
});
