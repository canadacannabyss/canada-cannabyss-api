/* eslint-disable array-callback-return */
const express = require('express');
const router = express.Router();

const BundlesController = require('../controllers/bundles')

router.get('', BundlesController.index);

router.get('/navbar/all', BundlesController.navbarAll);

router.get('/navbar/category/:category', BundlesController.navbarCategory);

router.get('/get/bundle/:slug', BundlesController.getBundleSlug);

router.get('/get/comments/:bundleId', BundlesController.getComment);

router.get('/get/categories', BundlesController.getCategories);

router.get('/get/bundles/category/:category', BundlesController.getBundlesCategory);

router.put('/update/how-many-viewed', BundlesController.updateHowManyViewed);

module.exports = router;
