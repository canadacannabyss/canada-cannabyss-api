const express = require('express');
const router = express.Router();

const AdminETransferController = require('../../../controllers/admin/e-transfers/e-transfers')

router.get('', AdminETransferController.index);

router.get('/validation/recipientEmail/:recipientEmail', AdminETransferController.validateRecipientEmail);

router.post('/create', AdminETransferController.create);

router.put('/delete/e-transfer/:id', AdminETransferController.delete);

module.exports = router;
