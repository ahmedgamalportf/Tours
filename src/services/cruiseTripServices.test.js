jest.mock('../models/CruiseTrip', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
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
  const cruiseTripId = '507f1f77bcf86cd799439011';
  const userId = '507f1f77bcf86cd799439012';

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
      userId
    );

    expect(CruiseTrip.findOne).toHaveBeenCalledWith({ name: 'Blue Pearl Yacht' });
    expect(CruiseTrip.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Red Sea Sunset Trip',
        name: 'Blue Pearl Yacht',
        createdBy: userId,
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
      cruiseTripServices.addCruiseTrip(validCruiseTripData, userId)
    ).rejects.toMatchObject({
      message: 'This yacht or boat name is exist already!',
      statusCode: 409,
    });
    expect(CruiseTrip.findOne).toHaveBeenCalledWith({ name: 'Blue Pearl Yacht' });
    expect(CruiseTrip.create).not.toHaveBeenCalled();
  });

  test('gets active cruise trips with pagination', async () => {
    const cruiseTrips = [{ _id: cruiseTripId, title: 'Red Sea Sunset Trip' }];

    CruiseTrip.find.mockResolvedValue(cruiseTrips);
    CruiseTrip.countDocuments.mockResolvedValue(1);

    const result = await cruiseTripServices.getAllCruiseTrips({ page: '2', limit: '5' });

    expect(CruiseTrip.find).toHaveBeenCalledWith({ isActive: true });
    expect(CruiseTrip.countDocuments).toHaveBeenCalledWith({ isActive: true });
    expect(result).toEqual({
      message: 'Cruises fetched successfully',
      pagination: {
        currentPage: 2,
        limit: 5,
        totalCruiseTrips: 1,
        totalPages: 1,
      },
      cruiseTrips,
    });
  });

  test('gets an active cruise trip by id without createdBy', async () => {
    const cruiseTrip = { _id: cruiseTripId, title: 'Red Sea Sunset Trip' };
    const select = jest.fn().mockResolvedValue(cruiseTrip);

    CruiseTrip.findOne.mockReturnValue({ select });

    const result = await cruiseTripServices.getAllCruisesTripsById(cruiseTripId);

    expect(CruiseTrip.findOne).toHaveBeenCalledWith({
      _id: cruiseTripId,
      isActive: true,
    });
    expect(select).toHaveBeenCalledWith('-createdBy');
    expect(result).toEqual({
      message: 'cruise trip fetched successfully',
      cruiseTrip,
    });
  });

  test('rejects invalid cruise trip id for public details', async () => {
    await expect(cruiseTripServices.getAllCruisesTripsById('bad-id')).rejects.toThrow(
      'Invalid cruise trip ID'
    );
  });

  test('gets all cruise trips for admin', async () => {
    const cruiseTrips = [{ _id: cruiseTripId, isActive: false }];

    CruiseTrip.find.mockResolvedValue(cruiseTrips);
    CruiseTrip.countDocuments.mockResolvedValue(1);

    const result = await cruiseTripServices.getAllCruiseTripsForAdmin({ page: '1', limit: '10' });

    expect(CruiseTrip.find).toHaveBeenCalledWith();
    expect(CruiseTrip.countDocuments).toHaveBeenCalledWith();
    expect(result.cruiseTrips).toEqual(cruiseTrips);
    expect(result.pagination.totalCruiseTrips).toBe(1);
  });

  test('gets a cruise trip by id for admin', async () => {
    const cruiseTrip = { _id: cruiseTripId, isActive: false };

    CruiseTrip.findOne.mockResolvedValue(cruiseTrip);

    const result = await cruiseTripServices.getAllCruiseTripsForAdminById(cruiseTripId);

    expect(CruiseTrip.findOne).toHaveBeenCalledWith({ _id: cruiseTripId });
    expect(result).toEqual({
      message: 'cruise trip fetched successfully',
      cruiseTrip,
    });
  });

  test('edits a cruise trip and recalculates duration when dates change', async () => {
    const currentCruiseTrip = {
      _id: cruiseTripId,
      startDateTime: new Date('2026-08-15T14:00:00.000Z'),
      endDateTime: new Date('2026-08-15T18:00:00.000Z'),
      capacity: 25,
      availableSeats: 25,
    };
    const updatedCruiseTrip = {
      ...currentCruiseTrip,
      name: 'Blue Pearl Yacht Updated',
      pricePerPerson: 90,
      startDateTime: new Date('2026-08-15T15:00:00.000Z'),
      endDateTime: new Date('2026-08-15T19:00:00.000Z'),
      durationHours: 4,
    };

    CruiseTrip.findOne.mockResolvedValue(null);
    CruiseTrip.findById.mockResolvedValue(currentCruiseTrip);
    CruiseTrip.findByIdAndUpdate.mockResolvedValue(updatedCruiseTrip);

    const result = await cruiseTripServices.editCruiseTrip(
      {
        name: ' Blue Pearl Yacht Updated ',
        pricePerPerson: '90',
        startDateTime: '2026-08-15T15:00:00.000Z',
        endDateTime: '2026-08-15T19:00:00.000Z',
      },
      cruiseTripId
    );

    expect(CruiseTrip.findOne).toHaveBeenCalledWith({
      _id: { $ne: cruiseTripId },
      name: 'Blue Pearl Yacht Updated',
    });
    expect(CruiseTrip.findById).toHaveBeenCalledWith(cruiseTripId);
    expect(CruiseTrip.findByIdAndUpdate).toHaveBeenCalledWith(
      cruiseTripId,
      expect.objectContaining({
        name: 'Blue Pearl Yacht Updated',
        pricePerPerson: 90,
        durationHours: 4,
      }),
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );
    expect(result).toEqual({
      message: 'CruiseTrip updated successfully',
      cruiseTrip: updatedCruiseTrip,
    });
  });

  test('rejects editing a cruise trip when seats exceed capacity', async () => {
    CruiseTrip.findById.mockResolvedValue({
      _id: cruiseTripId,
      startDateTime: new Date('2026-08-15T14:00:00.000Z'),
      endDateTime: new Date('2026-08-15T18:00:00.000Z'),
      capacity: 10,
      availableSeats: 10,
    });

    await expect(
      cruiseTripServices.editCruiseTrip({ availableSeats: 11 }, cruiseTripId)
    ).rejects.toThrow('Available seats cannot be greater than capacity');
    expect(CruiseTrip.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('soft deletes a cruise trip', async () => {
    const cruiseTrip = { _id: cruiseTripId, isActive: false };

    CruiseTrip.findByIdAndUpdate.mockResolvedValue(cruiseTrip);

    const result = await cruiseTripServices.softDeleteCruiseTrip(cruiseTripId);

    expect(CruiseTrip.findByIdAndUpdate).toHaveBeenCalledWith(
      cruiseTripId,
      { isActive: false },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );
    expect(result).toEqual({
      message: 'Cruise Trip soft deleted successfully',
      cruiseTrip,
    });
  });

  test('restores a cruise trip', async () => {
    const cruiseTrip = { _id: cruiseTripId, isActive: true };

    CruiseTrip.findByIdAndUpdate.mockResolvedValue(cruiseTrip);

    const result = await cruiseTripServices.restoreCruiseTrip(cruiseTripId);

    expect(CruiseTrip.findByIdAndUpdate).toHaveBeenCalledWith(
      cruiseTripId,
      { isActive: true },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );
    expect(result).toEqual({
      message: 'Cruise Trip restored successfully',
      cruiseTrip,
    });
  });

  test('hard deletes a cruise trip', async () => {
    const cruiseTrip = { _id: cruiseTripId };

    CruiseTrip.findByIdAndDelete.mockResolvedValue(cruiseTrip);

    const result = await cruiseTripServices.hardDeleteCruiseTrip(cruiseTripId);

    expect(CruiseTrip.findByIdAndDelete).toHaveBeenCalledWith(cruiseTripId);
    expect(result).toEqual({
      message: 'Cruise Trip permanently deleted successfully',
      cruiseTrip,
    });
  });

  test('returns not found when deleting a missing cruise trip', async () => {
    CruiseTrip.findByIdAndDelete.mockResolvedValue(null);

    await expect(cruiseTripServices.hardDeleteCruiseTrip(cruiseTripId)).rejects.toMatchObject({
      message: 'Cruise Trip not found',
      statusCode: 404,
    });
  });

  test('searches cruise trips with filters', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const skip = jest.fn(() => ({ limit }));
    const select = jest.fn(() => ({ skip }));

    CruiseTrip.find.mockReturnValue({ select });
    CruiseTrip.countDocuments.mockResolvedValue(0);

    const result = await cruiseTripServices.searchCruiseTrips({
      search: 'sunset',
      cruiseType: 'yacht',
      city: 'Hurghada',
      minPrice: '50',
      maxPrice: '100',
      minAvailableSeats: '2',
      includes: 'soft drinks,snorkeling',
    });

    expect(CruiseTrip.find).toHaveBeenCalledWith({
      isActive: true,
      cruiseType: 'yacht',
      city: { $regex: 'Hurghada', $options: 'i' },
      pricePerPerson: {
        $gte: 50,
        $lte: 100,
      },
      availableSeats: {
        $gte: 2,
      },
      includes: {
        $all: ['soft drinks', 'snorkeling'],
      },
      $or: [
        { title: { $regex: 'sunset', $options: 'i' } },
        { name: { $regex: 'sunset', $options: 'i' } },
        { description: { $regex: 'sunset', $options: 'i' } },
        { city: { $regex: 'sunset', $options: 'i' } },
        { country: { $regex: 'sunset', $options: 'i' } },
        { marinaName: { $regex: 'sunset', $options: 'i' } },
      ],
    });
    expect(select).toHaveBeenCalledWith('-createdBy');
    expect(result.cruiseTrips).toEqual([]);
  });

  test('rejects invalid cruise trip search filters', async () => {
    await expect(cruiseTripServices.searchCruiseTrips({ cruiseType: 'boat' })).rejects.toThrow(
      'Cruise type must be yacht or cruise'
    );
    await expect(cruiseTripServices.searchCruiseTrips({ minPrice: '-1' })).rejects.toThrow(
      'Minimum price must be a number greater than or equal to 0'
    );
    await expect(cruiseTripServices.searchCruiseTrips({ minAvailableSeats: 'abc' })).rejects.toThrow(
      'Minimum available seats must be a number greater than or equal to 0'
    );
  });
});
