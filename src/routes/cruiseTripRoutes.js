const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/allowRoles');


const {
addCruiseTrip,
getAllCruiseTrips,
getAllCruisesTripsById,
getAllCruiseTripsForAdmin,
getAllCruiseTripsForAdminById,
editCruiseTrip,
softDeleteCruiseTrip,
restoreCruiseTrip,
hardDeleteCruiseTrip,
searchCruiseTrips,

} = require('../controllers/cruiseTripController');


router.post('/addCruiseTrip',authMiddleware,allowRoles('admin'),addCruiseTrip);
router.get('/search',searchCruiseTrips);
router.get('/getAllCruiseTrips',getAllCruiseTrips)
router.get('/getAllCruisesTripsById/:id',getAllCruisesTripsById);
router.get('/getAllCruiseTripsForAdmin',authMiddleware,allowRoles('admin'),getAllCruiseTripsForAdmin);
router.get('/getAllCruiseTripsForAdminById/:id',authMiddleware,allowRoles('admin'),getAllCruiseTripsForAdminById);
router.patch('/editCruiseTrip/:id',authMiddleware,allowRoles('admin'),editCruiseTrip);
router.patch('/softDeleteCruiseTrip/:id', authMiddleware, allowRoles('admin'), softDeleteCruiseTrip);
router.patch('/restoreCruiseTrip/:id', authMiddleware, allowRoles('admin'), restoreCruiseTrip);
router.delete('/hardDeleteCruiseTrip/:id', authMiddleware, allowRoles('admin'), hardDeleteCruiseTrip);




module.exports = router;
