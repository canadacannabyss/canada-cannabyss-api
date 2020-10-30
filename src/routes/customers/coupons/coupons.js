/* eslint-disable array-callback-return */
const express = require('express');
const router = express.Router();

const CustomerCouponsController = require('../../../controllers/customers/coupons/coupons')

app.get('/get/', CustomerCouponsController.get);

module.exports = router;
