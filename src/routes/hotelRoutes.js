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
  editHotel,
  softDeleteHotel,
  restoreHotel,
  hardDeleteHotel,

} = require('../controllers/hotelController');

router.post('/addhotel', authMiddleware, allowRoles('admin'), addHotel);
router.get('/gethotels', gethotels);
router.get('/gethotels/:id', getHotelById);
router.get('/gethotelbyidforadmin/:id', authMiddleware, allowRoles('admin'), getHotelByIdForAdmin);
router.patch('/editHotel/:id', authMiddleware, allowRoles('admin'), editHotel);
router.patch('/softDelete/:id', authMiddleware, allowRoles('admin'), softDeleteHotel);
router.patch('/restore/:id', authMiddleware, allowRoles('admin'), restoreHotel);
router.delete('/hardDelete/:id', authMiddleware, allowRoles('admin'), hardDeleteHotel);

router.get(
  '/gethotelsForadmin',
  authMiddleware,
  allowRoles('admin'),
  gethotelsForadmin
);

module.exports = router;