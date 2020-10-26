const express = require('express');
const router = express.Router();

const AdminPostalServices = require('../../../controllers/admin/postalServices/postalServices')

router.get('', AdminPostalServices.index);

router.get('/validate/postal-service/:postalServiceName', AdminPostalServices.validatePostalServiceName);

router.get('/:slug', AdminPostalServices.getBySlug);

router.post('/create', AdminPostalServices.create);

router.put('/edit', AdminPostalServices.edit);

router.put('/delete/postal-service/:postalServiceId', AdminPostalServices.delete);

module.exports = router;
