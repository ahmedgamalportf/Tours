const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
  createBooking,
  confirmBookingPayment,
} = require('../controllers/bookingController');

router.post('/createBooking', authMiddleware, createBooking);
router.patch('/confirmPayment/:id', authMiddleware, confirmBookingPayment);

module.exports = router;
