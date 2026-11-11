const express = require('express');
const router = express.Router();
const mercari_controller = require('../controllers/mercari.controller');

router.get('/', mercari_controller.listar_mercari);

module.exports = router;