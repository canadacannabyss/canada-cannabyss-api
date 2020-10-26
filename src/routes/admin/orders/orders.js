const express = require('express');
const router = express.Router();

const AdminOrderController = require('../../../controllers/admin/orders/orders')

router.get('', AdminOrderController.index);

router.get('/:orderId', AdminOrderController.getById);

router.get('/:orderId/coordinates', AdminOrderController.getOrderCoordinates);

router.put('/update/:orderId', AdminOrderController.update);

router.put('/update/status/shipping', AdminOrderController.updateShippingStatus);

router.put('/update/status/paid', AdminOrderController.updatePaidStatus);

router.post('/send/tracking-number/start', AdminOrderController.sendTracknigNumber);

module.exports = router;
