const express = require('express');
const router = express.Router();

const multer = require('multer');
const multerConfig = require('../../../config/multer');
const _ = require('lodash');

const AdminBundleController = require('../../../controllers/admin/bundles/bundles');

router.get('', AdminBundleController.index);

router.get('/panel/get/:slug', AdminBundleController.panelGetBundleBySlug);

router.get('/:slug', AdminBundleController.getBundleBySlug);

router.get('/validation/slug/:slug', AdminBundleController.validateSlug);

router.post('/publish', AdminBundleController.publish);

router.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  AdminBundleController.uploadMedia
);

router.post('/set/global-variable', AdminBundleController.setGlobalVariable);

router.put('/update/:id', AdminBundleController.updateBundle);

router.put('/delete/bundle/:bundleId', AdminBundleController.deleteBundle);

module.exports = router;
