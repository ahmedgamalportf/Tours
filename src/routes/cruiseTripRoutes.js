const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/allowRoles');


const {
addCruiseTrip,
} = require('../controllers/cruiseTripController');

router.post('/addCruiseTrip',authMiddleware,allowRoles('admin'),addCruiseTrip);

module.exports = router;
