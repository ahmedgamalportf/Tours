const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/allowRoles');

const {
    addTours,
    getAllTours,
    getTourById,
    getAllToursForAdmin,
    getTourForAdminById,
    editTour,
    softDeleteTour,
    restoreTour,
    hardDeleteTour,
    searchTours,
    adminSearchTours,

}= require('../controllers/toursController');

router.post('/addTours',authMiddleware,allowRoles('admin'),addTours);
router.get('/search',searchTours);
router.get('/adminSearch',authMiddleware,allowRoles('admin'),adminSearchTours);
router.get('/getAllTours',getAllTours);
router.get('/getTourById/:id',getTourById);
router.get('/getAllToursForAdmin',authMiddleware,allowRoles('admin'),getAllToursForAdmin);
router.get('/getTourForAdminById/:id',authMiddleware,allowRoles('admin'),getTourForAdminById);
router.patch('/editTour/:id',authMiddleware,allowRoles('admin'),editTour);
router.patch('/softDeleteTour/:id',authMiddleware,allowRoles('admin'),softDeleteTour);
router.patch('/restoreTour/:id',authMiddleware,allowRoles('admin'),restoreTour);
router.delete('/hardDeleteTour/:id',authMiddleware,allowRoles('admin'),hardDeleteTour);


module.exports = router;
