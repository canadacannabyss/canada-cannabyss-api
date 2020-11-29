const express = require('express')
const router = express.Router()

const multer = require('multer')
const multerConfig = require('../../../config/multer/multerCategory')

const ResellerCategoryController = require('../../../controllers/reseller/category/category')

router.get('', ResellerCategoryController.index)

router.get('/panel/get/:slug', ResellerCategoryController.panelGetSlug)

router.get('/sync', ResellerCategoryController.sync)

router.get('/validation/slug/:slug', ResellerCategoryController.validateSlug)

router.post('/publish', ResellerCategoryController.create)

router.put('/update/:id', ResellerCategoryController.update)

router.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  ResellerCategoryController.upload,
)

router.post(
  '/set/global-variable',
  ResellerCategoryController.setGlobalVariable,
)

router.get('/get/cover/:id', ResellerCategoryController.getMedia)

router.put('/update/cover/:id', ResellerCategoryController.updateMedia)

router.put('/delete/category/:categoryId', ResellerCategoryController.delete)

router.put('/delete/media/:id', ResellerCategoryController.deleteMedia)

module.exports = router
