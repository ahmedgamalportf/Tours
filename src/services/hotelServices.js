const Hotel = require('../models/Hotel');
const mongoose = require('mongoose');

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
    
    if (!name || !description || !country || !city || !address || !location || !stars) {
        throw new Error('All required fields must be provided');
    }

    if (typeof name !== 'string' || !name.trim()) {
        throw new Error('Hotel name is required');
    }

    if (typeof description !== 'string' || !description.trim()) {
        throw new Error('Description is required');
    }

    if (typeof country !== 'string' || !country.trim()) {
        throw new Error('Country is required');
    }

    if (typeof city !== 'string' || !city.trim()) {
        throw new Error('City is required');
    }

    if (typeof address !== 'string' || !address.trim()) {
        throw new Error('Address is required');
    }

    if (typeof location !== 'string' || !location.trim()) {
        throw new Error('Location link is required');
    }

    if (typeof stars !== 'number' || stars < 1 || stars > 5) {
        throw new Error('Stars must be a number between 1 and 5');
    }

    const hotel = await Hotel.create({
        name: name.trim(),
        description: description.trim(),
        country: country.trim(),
        city: city.trim(),
        address: address.trim(),
        location: location.trim(),
        images: images || [],
        roomsAvailable: roomsAvailable || 0,
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

const gethotels =async()=>{
    const hotels = await Hotel.find({isActive:true})
    
    return {
        message:'hotel fetched successfully',
        hotels,
        count:hotels.length,
    }
}

const gethotelsForadmin = async (req, res) => {
  try {
    const results = await hotelServices.gethotelsForadmin();

    res.status(200).json({
      success: true,
      ...results,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


const getHotelById = async (hotelId) => {
  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    throw new Error('Invalid hotel ID');
  }

  const hotel = await Hotel.findOne({
    _id: hotelId,
    isActive: true,
  });

  if (!hotel) {
    throw new Error('Hotel not found');
  }

  return {
    message: 'Hotel fetched successfully',
    hotel,
  };
};

const getHotelByIdForAdmin = async (hotelId) => {
  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    throw new Error('Invalid hotel ID');
  }

  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    throw new Error('Hotel not found');
  }

  return {
    message: 'Hotel fetched successfully',
    hotel,
  };
};


const editHotel = async (hotelId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    throw new Error('Invalid hotel ID');
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
    throw new Error('No valid fields provided for update');
  }

  if (updates.name !== undefined) {
    if (typeof updates.name !== 'string' || !updates.name.trim()) {
      throw new Error('Hotel name must be a non-empty string');
    }
    updates.name = updates.name.trim();
  }

  if (updates.description !== undefined) {
    if (typeof updates.description !== 'string' || !updates.description.trim()) {
      throw new Error('Description must be a non-empty string');
    }
    updates.description = updates.description.trim();
  }

  if (updates.country !== undefined) {
    if (typeof updates.country !== 'string' || !updates.country.trim()) {
      throw new Error('Country must be a non-empty string');
    }
    updates.country = updates.country.trim();
  }

  if (updates.city !== undefined) {
    if (typeof updates.city !== 'string' || !updates.city.trim()) {
      throw new Error('City must be a non-empty string');
    }
    updates.city = updates.city.trim();
  }

  if (updates.address !== undefined) {
    if (typeof updates.address !== 'string' || !updates.address.trim()) {
      throw new Error('Address must be a non-empty string');
    }
    updates.address = updates.address.trim();
  }

  if (updates.location !== undefined) {
    if (typeof updates.location !== 'string' || !updates.location.trim()) {
      throw new Error('Location link must be a non-empty string');
    }
    updates.location = updates.location.trim();
  }

  if (updates.stars !== undefined) {
    if (typeof updates.stars !== 'number' || updates.stars < 1 || updates.stars > 5) {
      throw new Error('Stars must be a number between 1 and 5');
    }
  }

  if (updates.roomsAvailable !== undefined) {
    if (typeof updates.roomsAvailable !== 'number' || updates.roomsAvailable < 0) {
      throw new Error('Rooms available must be a number greater than or equal to 0');
    }
  }

  if (updates.images !== undefined && !Array.isArray(updates.images)) {
    throw new Error('Images must be an array');
  }

  if (updates.isFeatured !== undefined && typeof updates.isFeatured !== 'boolean') {
    throw new Error('isFeatured must be boolean');
  }

  if (updates.isActive !== undefined && typeof updates.isActive !== 'boolean') {
    throw new Error('isActive must be boolean');
  }

  const hotel = await Hotel.findByIdAndUpdate(
    hotelId,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!hotel) {
    throw new Error('Hotel not found');
  }

  return {
    message: 'Hotel updated successfully',
    hotel,
  };
};

module.exports = {
  addHotel,
  gethotels,
  gethotelsForadmin,
  getHotelById,
  getHotelByIdForAdmin,
  editHotel,
};