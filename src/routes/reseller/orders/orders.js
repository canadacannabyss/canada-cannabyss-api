const express = require('express');
const router = express.Router();

const ResellerOrdersController = require('../../../controllers/reseller/orders/orders')

router.get('', ResellerOrdersController.index);

router.get('/:orderId', ResellerOrdersController.getById);

router.put('/update/:orderId', ResellerOrdersController.update);

router.put('/update/status/shipping', ResellerOrdersController.updateStatusShipping);

router.put('/update/status/paid', ResellerOrdersController.updateStatusPaid);

router.post('/send/tracking-number/start', ResellerOrdersController.sendTrackingNumberStart);

module.exports = router;
