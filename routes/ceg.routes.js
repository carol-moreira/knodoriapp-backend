const express = require('express');
const router = express.Router();
const ceg_controller = require('../controllers/ceg.controller');

router.get('/', ceg_controller.listar_ceg);
router.post('/', ceg_controller.criar_ceg);

module.exports = router;
