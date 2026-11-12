const express = require('express');
const router = express.Router();
const claim_controller = require('../controllers/claim.controller');

router.get('/', claim_controller.listar_claims);
router.post('/', claim_controller.criar_claim);

module.exports = router;
