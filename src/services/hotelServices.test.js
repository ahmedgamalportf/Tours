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
});
