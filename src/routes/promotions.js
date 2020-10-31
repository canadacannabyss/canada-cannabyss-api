const express = require('express');
const router = express.Router();

const multer = require('multer');
const multerConfig = require('../config/multerPromotion');

const PromotionsController = require('../controllers/promotions')

router.get('/get/all', PromotionsController.index);

router.get('/get/slug/:slug', PromotionsController.getBySlug);

router.get('/validation/slug/:slug', PromotionsController.validateSlug);

router.post('/publish', PromotionsController.create);

router.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  PromotionsController.uploadMedia
);

router.post('/set/global-variable', PromotionsController.setGlobalVariable);

router.put('/update/:id', PromotionsController.update);

router.delete('/delete/:id', PromotionsController.oldDelete);

router.delete('/delete/cover/:id', PromotionsController.oldDeleteMedia);

module.exports = router;
