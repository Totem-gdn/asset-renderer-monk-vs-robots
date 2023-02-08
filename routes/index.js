const express = require('express');
const controllers = require('../controllers');
const router = express.Router();

/* GET home page. */
router.get('/:type/:id', controllers.api.nft.get);
router.get('/info', controllers.api.info.get);

module.exports = router;
