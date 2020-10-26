const express = require('express');
const router = express.Router();

const multer = require('multer');
const multerConfig = require('../../../config/multer');

const AdminProductController = require('../../../controllers/admin/products/products')

router.get('', AdminProductController.index);

router.get('/bundle/products', AdminProductController.getBundleProducts);

router.get('/panel/get/:slug', AdminProductController.panelGetProductBySlug);

router.get('/validation/slug/:slug', AdminProductController.validateSlug);

router.post('/publish', AdminProductController.publish);

router.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  AdminProductController.uploadMedia
);

router.post('/set/global-variable', AdminProductController.setGlobalVariable);

router.put('/update/:id', AdminProductController.updateProduct);

router.get('/:slug', AdminProductController.getProductBySlug);

router.put('/delete/product/:productId', AdminProductController.deleteProduct);

router.put('/delete/cover/:id', AdminProductController.deleteMedia);

module.exports = router;
