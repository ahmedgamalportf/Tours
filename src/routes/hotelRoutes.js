const express = require('express');
const router = express.Router();

const { addHotel } = require('../controllers/hotelController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/allowRoles');

router.post('/addhotel', authMiddleware, allowRoles('admin'), addHotel);

module.exports = router;
