const Hotel = require('../models/Hotel');


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

module.exports = {
  addHotel,
};