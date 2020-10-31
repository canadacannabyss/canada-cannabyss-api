const express = require('express');
const router = express.Router();

const HomeController = require('../controllers/home')

router.get('/main/products', HomeController.mainProducts);

router.get('/main/bundles', HomeController.mainBundles);

router.get('/main/banners', HomeController.mainBanners);

router.get('/main/most-bought', HomeController.mainMostBought)

router.get('/main/category', HomeController.mainCategories);

router.get('/main/newest/products', HomeController.mainNewestProducts);

router.get('/get/product/:slug', HomeController.getProductSlug);

router.get('/get/comments/:productId', HomeController.getComment);

module.exports = router;
