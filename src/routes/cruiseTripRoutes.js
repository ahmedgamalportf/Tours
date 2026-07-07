const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/allowRoles');




module.exports = router;