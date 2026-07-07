jest.mock('../models/CruiseTrip', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

const CruiseTrip = require('../models/CruiseTrip');
const cruiseTripServices = require('./cruiseTripServices');

describe('cruiseTripServices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validCruiseTripData = {
    title: 'Red Sea Sunset Trip',
    name: 'Blue Pearl Yacht',
    description: 'A relaxing sunset yacht trip.',
    cruiseType: 'yacht',
    country: 'Egypt',
    city: 'Hurghada',
    marinaName: 'Hurghada Marina',
    address: 'Hurghada Marina, Red Sea Governorate',
    mapLink: 'https://maps.google.com/?q=Hurghada+Marina',
    startDateTime: '2026-08-15T14:00:00.000Z',
    endDateTime: '2026-08-15T18:00:00.000Z',
    capacity: 25,
    availableSeats: 25,
    pricePerPerson: 75,
  };

  test('creates a cruise trip using name as the yacht or boat name', async () => {
    const createdCruiseTrip = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Red Sea Sunset Trip',
      name: 'Blue Pearl Yacht',
    };

    CruiseTrip.findOne.mockResolvedValue(null);
    CruiseTrip.create.mockResolvedValue(createdCruiseTrip);

    const result = await cruiseTripServices.addCruiseTrip(
      {
        ...validCruiseTripData,
        title: ' Red Sea Sunset Trip ',
        name: ' Blue Pearl Yacht ',
      },
      '507f1f77bcf86cd799439012'
    );

    expect(CruiseTrip.findOne).toHaveBeenCalledWith({ name: 'Blue Pearl Yacht' });
    expect(CruiseTrip.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Red Sea Sunset Trip',
        name: 'Blue Pearl Yacht',
        createdBy: '507f1f77bcf86cd799439012',
      })
    );
    expect(result).toEqual({
      message: 'CruiseTrip created successfully',
      cruiseTrip: createdCruiseTrip,
    });
  });

  test('rejects duplicate yacht or boat names', async () => {
    CruiseTrip.findOne.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'Blue Pearl Yacht',
    });

    await expect(
      cruiseTripServices.addCruiseTrip(validCruiseTripData, '507f1f77bcf86cd799439012')
    ).rejects.toMatchObject({
      message: 'This yacht or boat name is exist already!',
      statusCode: 409,
    });
    expect(CruiseTrip.findOne).toHaveBeenCalledWith({ name: 'Blue Pearl Yacht' });
    expect(CruiseTrip.create).not.toHaveBeenCalled();
  });
});
