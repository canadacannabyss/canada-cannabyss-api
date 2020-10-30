const express = require('express');
const router = express.Router();

const CustomerBillingController = require('../../../controllers/customers/billing/biling')

router.post('/create', CustomerBillingController.create);

router.get('/get/billing/:billingId', CustomerBillingController.getById);

router.get('/get/all/:userId', CustomerBillingController.getAllByUser);

router.put('/edit/:billingId', CustomerBillingController.edit);

router.put('/delete/:billingId', CustomerBillingController.delete);

module.exports = router;
