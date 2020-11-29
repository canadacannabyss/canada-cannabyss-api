const express = require('express')
const router = express.Router()

const multer = require('multer')
const multerConfig = require('../../../config/multer/multer')

const ResellerProductsController = require('../../../controllers/reseller/products/products')

router.get('', ResellerProductsController.index)

router.get('/panel/get/:slug', ResellerProductsController.panelGetBySlug)

router.get('/validation/slug/:slug', ResellerProductsController.validateSlug)

router.post('/publish', ResellerProductsController.create)

router.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  ResellerProductsController.uploadMedia,
)

router.post(
  '/set/global-variable',
  ResellerProductsController.seetGlobalVariable,
)

router.put('/update/:id', ResellerProductsController.update)

router.get('/:slug', ResellerProductsController.getBySlug)

router.delete('/delete/product/:productId', ResellerProductsController.delete)

router.delete('/delete/cover/:id', ResellerProductsController.deleteMedia)

module.exports = router
