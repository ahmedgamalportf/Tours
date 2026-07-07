jest.mock('../models/Hotel', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
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

  test('creates a hotel when the name is not already used', async () => {
    const hotelData = {
      name: ' Sea View Hotel ',
      description: 'Beach resort',
      country: ' Egypt ',
      city: ' Hurghada ',
      address: ' Marina ',
      location: 'https://maps.example/hotel',
      roomsAvailable: 10,
      stars: 5,
    };
    const createdHotel = { _id: '507f1f77bcf86cd799439011', name: 'Sea View Hotel' };

    Hotel.findOne.mockResolvedValue(null);
    Hotel.create.mockResolvedValue(createdHotel);

    const result = await hotelServices.addHotel(hotelData, '507f1f77bcf86cd799439012');

    expect(Hotel.findOne).toHaveBeenCalledWith({ name: 'Sea View Hotel' });
    expect(Hotel.create).toHaveBeenCalledWith({
      name: 'Sea View Hotel',
      description: 'Beach resort',
      country: 'Egypt',
      city: 'Hurghada',
      address: 'Marina',
      location: 'https://maps.example/hotel',
      images: [],
      roomsAvailable: 10,
      isFeatured: false,
      isActive: true,
      stars: 5,
      createdBy: '507f1f77bcf86cd799439012',
    });
    expect(result).toEqual({
      message: 'hotel created successfully',
      hotel: createdHotel,
    });
  });

  test('rejects creating a hotel when the name is already used', async () => {
    Hotel.findOne.mockResolvedValue({ _id: '507f1f77bcf86cd799439011', name: 'Sea View Hotel' });

    await expect(
      hotelServices.addHotel(
        {
          name: 'Sea View Hotel',
          description: 'Beach resort',
          country: 'Egypt',
          city: 'Hurghada',
          address: 'Marina',
          location: 'https://maps.example/hotel',
          roomsAvailable: 10,
          stars: 5,
        },
        '507f1f77bcf86cd799439012'
      )
    ).rejects.toMatchObject({
      message: 'Hotel is exist already!',
      statusCode: 409,
    });
    expect(Hotel.create).not.toHaveBeenCalled();
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
