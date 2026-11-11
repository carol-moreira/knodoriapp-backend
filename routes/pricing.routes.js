const express = require('express');
const router = express.Router();
const pricing_controller = require('../controllers/pricing.controller');

router.post('/', pricing_controller.calcular);

module.exports = router;
