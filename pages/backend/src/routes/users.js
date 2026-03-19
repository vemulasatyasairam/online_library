const express = require('express');
const router = express.Router();
const controller = require('../controllers/savedController');

// GET /api/users/:email/saved
router.get('/:email/saved', controller.getSaved);
// POST /api/users/:email/saved
router.post('/:email/saved', controller.addSaved);

module.exports = router;
