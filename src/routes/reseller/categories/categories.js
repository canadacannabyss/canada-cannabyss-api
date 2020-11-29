const express = require('express')
const router = express.Router()

const multer = require('multer')
const multerConfig = require('../../../config/multer/multerCategory')

const ResellerCategoriesController = require('../../../controllers/reseller/categories/categories')

router.get('', ResellerCategoriesController.index)

router.get('/panel/get/:slug', ResellerCategoriesController.panelGetBySlug)

router.get('/sync', ResellerCategoriesController.sync)

// Check if Podcast slug is valid
router.get('/validation/slug/:slug', ResellerCategoriesController.validateSlug)

router.post('/publish', ResellerCategoriesController.create)

router.put('/update/:id', ResellerCategoriesController.update)

router.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  ResellerCategoriesController.uploadMedia,
)

router.post(
  '/set/global-variable',
  ResellerCategoriesController.setGlobalVariable,
)

router.get('/get/cover/:id', ResellerCategoriesController.getMediaById)

router.put('/update/cover/:id', ResellerCategoriesController.updateMedia)

router.delete(
  '/delete/category/:categoryId',
  ResellerCategoriesController.delete,
)

router.delete('/delete/media/:id', ResellerCategoriesController.deleteMedia)

module.exports = router
