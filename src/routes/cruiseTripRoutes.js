const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/allowRoles');


const {
addCruiseTrip,
getAllCruiseTrips,
} = require('../controllers/cruiseTripController');

router.get('/getAllCruiseTrips',getAllCruiseTrips)
router.post('/addCruiseTrip',authMiddleware,allowRoles('admin'),addCruiseTrip);

module.exports = router;
