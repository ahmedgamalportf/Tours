const mongoose = require('mongoose');

const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Tour = require('../models/Tour');
const CruiseTrip = require('../models/CruiseTrip');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeObjectId = (id) => String(id || '').trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

const parsePositiveInteger = (value, fieldName) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw createError(`${fieldName} must be a positive integer`, 400);
  }

  return parsedValue;
};

const parseNonNegativeInteger = (value, fieldName) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw createError(`${fieldName} must be a number greater than or equal to 0`, 400);
  }

  return parsedValue;
};

const parseDate = (value, fieldName) => {
  const parsedDate = new Date(value);

  if (!value || isNaN(parsedDate.getTime())) {
    throw createError(`${fieldName} must be a valid date`, 400);
  }

  return parsedDate;
};

const getRoomImage = (room) => {
  const firstImage = room.images?.[0];
  return typeof firstImage === 'string' ? firstImage : firstImage?.url;
};

const getFirstStringImage = (images) => {
  const firstImage = images?.[0];
  return typeof firstImage === 'string' ? firstImage : firstImage?.url;
};

const getPaidOverlappingRoomBookingsCount = async (booking) => {
  const overlappingBookings = await Booking.find({
    _id: { $ne: booking._id },
    bookingType: 'room',
    item: booking.item,
    status: 'confirmed',
    paymentStatus: 'paid',
    checkInDate: { $lt: booking.checkOutDate },
    checkOutDate: { $gt: booking.checkInDate },
  });

  return overlappingBookings.reduce((total, currentBooking) => total + currentBooking.roomsCount, 0);
};

const createRoomBooking = async (bookingData, userId) => {
  userId = normalizeObjectId(userId);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createError('Invalid user ID', 400);
  }

  const {
    item,
    customerName,
    customerEmail,
    customerPhone,
    checkInDate,
    checkOutDate,
    roomsCount,
    guests = {},
    specialRequests,
  } = bookingData;

  const roomId = normalizeObjectId(item);

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw createError('Invalid Room ID', 400);
  }

  if (!customerName || !customerName.trim()) {
    throw createError('Customer name is required', 400);
  }

  if (!customerEmail || !customerEmail.trim()) {
    throw createError('Customer email is required', 400);
  }

  if (!customerPhone || !customerPhone.trim()) {
    throw createError('Customer phone is required', 400);
  }

  const parsedCheckInDate = parseDate(checkInDate, 'Check in date');
  const parsedCheckOutDate = parseDate(checkOutDate, 'Check out date');

  if (parsedCheckOutDate <= parsedCheckInDate) {
    throw createError('Check out date must be after check in date', 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (parsedCheckInDate < today) {
    throw createError('Check in date cannot be in the past', 400);
  }

  const parsedRoomsCount = parsePositiveInteger(roomsCount, 'Rooms count');
  const adults = parsePositiveInteger(guests.adults, 'Adults');
  const children = guests.children === undefined
    ? 0
    : parseNonNegativeInteger(guests.children, 'Children');

  const room = await Room.findById(roomId).populate('hotel', 'name city country');

  if (!room) {
    throw createError('Room not found', 404);
  }

  if (!room.isActive || !room.isAvailable) {
    throw createError('Room is not available for booking', 400);
  }

  if (parsedRoomsCount > room.totalRooms) {
    throw createError('Rooms count cannot be greater than total rooms', 400);
  }

  const maxAdults = room.capacity.adults * parsedRoomsCount;
  const maxChildren = room.capacity.children * parsedRoomsCount;

  if (adults > maxAdults) {
    throw createError(`Adults cannot be greater than ${maxAdults} for ${parsedRoomsCount} room(s)`, 400);
  }

  if (children > maxChildren) {
    throw createError(`Children cannot be greater than ${maxChildren} for ${parsedRoomsCount} room(s)`, 400);
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const nightsCount = Math.ceil((parsedCheckOutDate - parsedCheckInDate) / millisecondsPerDay);
  const unitPrice = room.pricePerNight;
  const totalPrice = unitPrice * parsedRoomsCount * nightsCount;

  const booking = await Booking.create({
    user: userId,
    bookingType: 'room',
    item: room._id,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    customerPhone: customerPhone.trim(),
    checkInDate: parsedCheckInDate,
    checkOutDate: parsedCheckOutDate,
    roomsCount: parsedRoomsCount,
    guests: {
      adults,
      children,
    },
    nightsCount,
    unitPrice,
    totalPrice,
    status: 'pending',
    paymentStatus: 'unpaid',
    specialRequests: specialRequests?.trim(),
    itemSnapshot: {
      title: room.hotel?.name,
      name: room.roomName,
      city: room.hotel?.city,
      country: room.hotel?.country,
      image: getRoomImage(room),
    },
  });

  return {
    message: 'Room booking created successfully. Payment is pending',
    booking,
  };
};

const createTourBooking = async (bookingData, userId) => {
  userId = normalizeObjectId(userId);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createError('Invalid user ID', 400);
  }

  const {
    item,
    customerName,
    customerEmail,
    customerPhone,
    personsCount,
    specialRequests,
  } = bookingData;

  const tourId = normalizeObjectId(item);

  if (!mongoose.Types.ObjectId.isValid(tourId)) {
    throw createError('Invalid tour ID', 400);
  }

  if (!customerName || !customerName.trim()) {
    throw createError('Customer name is required', 400);
  }

  if (!customerEmail || !customerEmail.trim()) {
    throw createError('Customer email is required', 400);
  }

  if (!customerPhone || !customerPhone.trim()) {
    throw createError('Customer phone is required', 400);
  }

  const parsedPersonsCount = parsePositiveInteger(personsCount, 'Persons count');
  const tour = await Tour.findById(tourId);

  if (!tour) {
    throw createError('Tour not found', 404);
  }

  if (!tour.isActive || !tour.isAvailable) {
    throw createError('Tour is not available for booking', 400);
  }

  if (tour.startDateTime <= new Date()) {
    throw createError('Tour booking is closed', 400);
  }

  if (parsedPersonsCount > tour.availableSeats) {
    throw createError('Not enough available seats', 400);
  }

  const unitPrice = tour.pricePerPerson;
  const totalPrice = unitPrice * parsedPersonsCount;

  const booking = await Booking.create({
    user: userId,
    bookingType: 'tour',
    item: tour._id,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    customerPhone: customerPhone.trim(),
    personsCount: parsedPersonsCount,
    tripStartDate: tour.startDateTime,
    tripEndDate: tour.endDateTime,
    unitPrice,
    totalPrice,
    status: 'pending',
    paymentStatus: 'unpaid',
    specialRequests: specialRequests?.trim(),
    itemSnapshot: {
      title: tour.title,
      name: tour.name,
      city: tour.city,
      country: tour.country,
      image: getFirstStringImage(tour.images),
    },
  });

  return {
    message: 'Tour booking created successfully. Payment is pending',
    booking,
  };
};

const createCruiseTripBooking = async (bookingData, userId) => {
  userId = normalizeObjectId(userId);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createError('Invalid user ID', 400);
  }

  const {
    item,
    customerName,
    customerEmail,
    customerPhone,
    personsCount,
    specialRequests,
  } = bookingData;

  const cruiseTripId = normalizeObjectId(item);

  if (!mongoose.Types.ObjectId.isValid(cruiseTripId)) {
    throw createError('Invalid Cruise Trip ID', 400);
  }

  if (!customerName || !customerName.trim()) {
    throw createError('Customer name is required', 400);
  }

  if (!customerEmail || !customerEmail.trim()) {
    throw createError('Customer email is required', 400);
  }

  if (!customerPhone || !customerPhone.trim()) {
    throw createError('Customer phone is required', 400);
  }

  const parsedPersonsCount = parsePositiveInteger(personsCount, 'Persons count');
  const cruiseTrip = await CruiseTrip.findById(cruiseTripId);

  if (!cruiseTrip) {
    throw createError('Cruise Trip not found', 404);
  }

  if (!cruiseTrip.isActive || !cruiseTrip.isAvailable) {
    throw createError('Cruise Trip is not available for booking', 400);
  }

  if (cruiseTrip.startDateTime <= new Date()) {
    throw createError('Cruise Trip booking is closed', 400);
  }

  if (parsedPersonsCount > cruiseTrip.availableSeats) {
    throw createError('Not enough available seats', 400);
  }

  const unitPrice = cruiseTrip.pricePerPerson;
  const totalPrice = unitPrice * parsedPersonsCount;

  const booking = await Booking.create({
    user: userId,
    bookingType: 'cruiseTrip',
    item: cruiseTrip._id,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    customerPhone: customerPhone.trim(),
    personsCount: parsedPersonsCount,
    tripStartDate: cruiseTrip.startDateTime,
    tripEndDate: cruiseTrip.endDateTime,
    unitPrice,
    totalPrice,
    status: 'pending',
    paymentStatus: 'unpaid',
    specialRequests: specialRequests?.trim(),
    itemSnapshot: {
      title: cruiseTrip.title,
      name: cruiseTrip.name,
      city: cruiseTrip.city,
      country: cruiseTrip.country,
      image: getFirstStringImage(cruiseTrip.images),
    },
  });

  return {
    message: 'Cruise Trip booking created successfully. Payment is pending',
    booking,
  };
};

const createBooking = async (bookingData, userId) => {
  const { bookingType } = bookingData;

  if (bookingType === 'room') {
    return createRoomBooking(bookingData, userId);
  }

  if (bookingType === 'tour') {
    return createTourBooking(bookingData, userId);
  }

  if (bookingType === 'cruiseTrip') {
    return createCruiseTripBooking(bookingData, userId);
  }

  throw createError('Invalid booking type', 400);
};

const confirmRoomBookingPayment = async (booking) => {
  const room = await Room.findById(booking.item);

  if (!room) {
    throw createError('Room not found', 404);
  }

  if (!room.isActive) {
    throw createError('Room is not active', 400);
  }

  const bookedRoomsCount = await getPaidOverlappingRoomBookingsCount(booking);
  const availableRoomsForDates = room.totalRooms - bookedRoomsCount;

  if (availableRoomsForDates < booking.roomsCount) {
    throw createError('Not enough rooms available for these dates', 400);
  }

  booking.status = 'confirmed';
  booking.paymentStatus = 'paid';
  await booking.save();

  return booking;
};

const confirmTourBookingPayment = async (booking) => {
  const tour = await Tour.findById(booking.item);

  if (!tour) {
    throw createError('Tour not found', 404);
  }

  if (!tour.isActive || !tour.isAvailable) {
    throw createError('Tour is not available for booking', 400);
  }

  if (tour.startDateTime <= new Date()) {
    throw createError('Tour booking is closed', 400);
  }

  if (tour.availableSeats < booking.personsCount) {
    throw createError('Not enough available seats', 400);
  }

  tour.availableSeats -= booking.personsCount;

  if (tour.availableSeats === 0) {
    tour.isAvailable = false;
  }

  await tour.save();

  booking.status = 'confirmed';
  booking.paymentStatus = 'paid';
  await booking.save();

  return booking;
};

const confirmCruiseTripBookingPayment = async (booking) => {
  const cruiseTrip = await CruiseTrip.findById(booking.item);

  if (!cruiseTrip) {
    throw createError('Cruise Trip not found', 404);
  }

  if (!cruiseTrip.isActive || !cruiseTrip.isAvailable) {
    throw createError('Cruise Trip is not available for booking', 400);
  }

  if (cruiseTrip.startDateTime <= new Date()) {
    throw createError('Cruise Trip booking is closed', 400);
  }

  if (cruiseTrip.availableSeats < booking.personsCount) {
    throw createError('Not enough available seats', 400);
  }

  cruiseTrip.availableSeats -= booking.personsCount;

  if (cruiseTrip.availableSeats === 0) {
    cruiseTrip.isAvailable = false;
  }

  await cruiseTrip.save();

  booking.status = 'confirmed';
  booking.paymentStatus = 'paid';
  await booking.save();

  return booking;
};

const confirmBookingPayment = async (bookingId) => {
  bookingId = normalizeObjectId(bookingId);

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw createError('Invalid booking ID', 400);
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw createError('Booking not found', 404);
  }

  if (booking.status !== 'pending' || booking.paymentStatus !== 'unpaid') {
    throw createError('Only pending unpaid bookings can be paid', 400);
  }

  let paidBooking;

  if (booking.bookingType === 'room') {
    paidBooking = await confirmRoomBookingPayment(booking);
  } else if (booking.bookingType === 'tour') {
    paidBooking = await confirmTourBookingPayment(booking);
  } else if (booking.bookingType === 'cruiseTrip') {
    paidBooking = await confirmCruiseTripBookingPayment(booking);
  } else {
    throw createError('Invalid booking type', 400);
  }

  return {
    message: 'Payment confirmed successfully',
    booking: paidBooking,
  };
};

module.exports = {
  createBooking,
  confirmBookingPayment,
};
