const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/allowRoles');

const {
    addRoom,
    getRoom,
    getRoomById,
} = require('../controllers/roomController');

router.post('/:hotelId/addRoom', authMiddleware, allowRoles('admin'), addRoom);

router.get('/getRoom', getRoom);

router.get('/getRoom/:id',getRoomById)

module.exports = router;
