const express = require('express');
const router = express.Router();

const AddressController = require('../../controllers/addresses/addresses')

router.get('/get/all/provinces', AddressController.getAllProvinces);

router.get('/get/all/cities', AddressController.getAllCities);

router.get('/get/all/cities/from/:province', AddressController.getAllCitiesFromProvince);

module.exports = router;
