const express = require('express');
const router = express.Router();

const multer = require('multer');
const multerConfig = require('../../../config/multer');

const ResellerBundlesController = require('../../../controllers/reseller/bundles/bundles')

router.get('', ResellerBundlesController.index);

router.get('/panel/get/:slug', ResellerBundlesController.panelGetBySlug);

router.get('/:slug', ResellerBundlesController.getBySlug);

// Check if Podcast slug is valid
router.get('/validation/slug/:slug', ResellerBundlesController.validateSlug);

router.post('/publish', ResellerBundlesController.create);

router.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  ResellerBundlesController.uploadMedia
);

router.post('/set/global-variable', ResellerBundlesController.setGlobalVariable);

router.put('/update/:id', ResellerBundlesController.update);

router.delete('/delete/:id', ResellerBundlesController.oldDelete);

router.delete('/delete/bundle/:bundleId', ResellerBundlesController.delete);

router.delete('/delete/cover/:id', ResellerBundlesController.deleteMedia);

module.exports = router;
