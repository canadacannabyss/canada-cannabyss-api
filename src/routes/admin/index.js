const express = require('express');
const router = express.Router();

const AdminPanelController = require('../../controllers/admin/index')

router.get('/panel/get/all/products', AdminPanelController.getAllProducts);

router.get('/panel/get/all/bundles', AdminPanelController.getAllBundles);

router.get('/panel/get/all/promotions', AdminPanelController.getAllPromotions);

router.get('/panel/get/all/banners', AdminPanelController.getAllBanners);

router.get('/panel/get/categories/products', AdminPanelController.getCategoriesProducts);

router.get('/panel/get/categories/promotion', AdminPanelController.getCategoriesPromotions);

router.get('/panel/get/categories/banner', AdminPanelController.getCategoriesBanners);

router.get('/panel/get/products/by/category/:category', AdminPanelController.getProductsByCategory);

router.get('/panel/get/bundles/by/category/:category', AdminPanelController.getBundlesByCategory);

router.get('/panel/get/promotions/by/category/:category', AdminPanelController.getPromotionsByCategory);

router.get('/panel/get/banners/by/category/:category', AdminPanelController.getBannersByCategory);

router.get('/panel/get/categories/bundles', AdminPanelController.getCategoriesBundles);

router.get('/panel/get/bundles/by/category/:category', AdminPanelController.getBundlesByCategory);

module.exports = router;
