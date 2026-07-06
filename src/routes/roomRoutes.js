const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/allowRoles');

const {
    addRoom,
    getRooms,
    getRoomById,
    getRoomByIdForAdmin,
    editRoom,
    softDeleteRoom,
    restoreRoom,
    hardDeleteRoom,

} = require('../controllers/roomController');

router.post('/:hotelId/addRoom', authMiddleware, allowRoles('admin'), addRoom);
router.post('/addRoom', authMiddleware, allowRoles('admin'), addRoom);
router.get('/getRooms', getRooms);
router.get('/getRoom/:id',getRoomById);
router.get('/getRoomByIdForAdmin/:id', authMiddleware, allowRoles('admin'), getRoomByIdForAdmin)
router.patch('/softDeleteRoom/:id', authMiddleware, allowRoles('admin'), softDeleteRoom);
router.patch('/restoreRoom/:id', authMiddleware, allowRoles('admin'), restoreRoom);
router.delete('/hardRoom/:id', authMiddleware, allowRoles('admin'), hardDeleteRoom);


router.patch('/editRoom/:id', authMiddleware, allowRoles('admin'), editRoom);

module.exports = router;
