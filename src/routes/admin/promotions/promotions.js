const express = require('express');
const router = express.Router();

const multer = require('multer');
const multerConfig = require('../../../config/multerPromotion');

const AdminPromotionController = require('../../../controllers/admin/promotions/promotions')

router.get('', AdminPromotionController.index);

router.get('/get/all', AdminPromotionController.getAllPromotions);

router.get('/get/slug/:slug', AdminPromotionController.getPromotionBySlug);

router.get('/:slug', AdminPromotionController.getBySlug);

router.get('/validation/slug/:slug', AdminPromotionController.validateSlug);

router.post('/publish', AdminPromotionController.publish);

router.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  AdminPromotionController.uploadMedia
);

router.post('/set/global-variable', AdminPromotionController.setGlobalVariable);

router.put('/update/:id', AdminPromotionController.update);

router.put('/delete/promotion/:promotionId', AdminPromotionController.delete);

router.put('/delete/cover/:id', AdminPromotionController.deleteMedia);

router.get('/panel/get/:slug', AdminPromotionController.panelGetBySlug);

module.exports = router;
