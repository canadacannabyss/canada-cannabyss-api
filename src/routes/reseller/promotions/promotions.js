const express = require('express')
const router = express.Router()

const multer = require('multer')
const multerConfig = require('../../../config/multer/multerPromotion')

const ResellerPromotionsController = require('../../../controllers/reseller/promotions/promotions')

router.get('', ResellerPromotionsController.index)

router.get('/get/all', ResellerPromotionsController.getAll)

router.get('/get/slug/:slug', ResellerPromotionsController.getBySlug)

router.get('/:slug', ResellerPromotionsController.slug)

router.get('/validation/slug/:slug', ResellerPromotionsController.validateSlug)

router.post('/publish', ResellerPromotionsController.create)

router.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  ResellerPromotionsController.uploadMedia,
)

router.post(
  '/set/global-variable',
  ResellerPromotionsController.setGlobalVariable,
)

router.put('/update/:id', ResellerPromotionsController.update)

router.delete(
  '/delete/promotion/:promotionId',
  ResellerPromotionsController.delete,
)

router.delete('/delete/:id', ResellerPromotionsController.oldDelete)

router.delete('/delete/cover/:id', ResellerPromotionsController.deleteMedia)

router.get('/panel/get/:slug', ResellerPromotionsController.panelGetSlug)

module.exports = router
