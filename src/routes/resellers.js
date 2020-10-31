/* eslint-disable array-callback-return */
const express = require('express');
const router = express.Router();

const ResellersController = require('../controllers/resellers')

router.get('/product/products/:userId', ResellersController.productProducts);

router.get('/bundle/bundles/:userId', ResellersController.bundleBundles);

module.exports = router;
