const express = require('express');
const router = express.Router();

const ProductsController = require('../controllers/products')

router.get('', ProductsController.index);

router.get('/navbar/all', ProductsController.navbarAll);

router.get('/navbar/category/:category', ProductsController.navbarCategory);

router.get('/get/product/:slug', ProductsController.getProductBySlug);

router.get('/get/comments/:productId', ProductsController.getComments);

router.get('/get/categories', ProductsController.getCategories);

router.get('/get/products/category/:category', ProductsController.getProductsCategory);

router.get('/get/products/tag/:tag', ProductsController.getProductsTag);

router.put('/update/how-many-viewed', ProductsController.updateHowManyViewed);

module.exports = router;
