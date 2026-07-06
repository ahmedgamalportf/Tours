const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/allowRoles');

const {
  addHotel,
  gethotels,
  gethotelsForadmin,
  getHotelById,
  getHotelByIdForAdmin,

} = require('../controllers/hotelController');

router.post('/addhotel', authMiddleware, allowRoles('admin'), addHotel);
router.get('/gethotels', gethotels);
router.get('/gethotels/:id', getHotelById);
router.get('/gethotelbyidforadmin/:id', authMiddleware, allowRoles('admin'), getHotelByIdForAdmin);



router.get(
  '/gethotelsForadmin',
  authMiddleware,
  allowRoles('admin'),
  gethotelsForadmin
);

module.exports = router;