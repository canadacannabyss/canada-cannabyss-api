const express = require('express');
const router = express.Router();

const ResellerController = require('../../controllers/reseller/index')

router.get('/panel/get/all/products', ResellerController.panelGetAllProducts);

router.get('/panel/get/all/bundles', ResellerController.panelGetAllBundles);

router.get('/panel/get/all/promotions', ResellerController.panelGetAllPromotions);

router.get('/panel/get/all/banners', ResellerController.panelGetAllBanners);

router.get('/panel/get/categories/products', ResellerController.panelGetCategoriesProducts);

router.get('/panel/get/categories/promotion', ResellerController.panelGetCategoriesPromotions);

router.get('/panel/get/categories/banner', ResellerController.panelGetCategoriesBanners);

router.get('/panel/get/products/by/category/:category', ResellerController.panelGetProductsByCategory);

router.get('/panel/get/bundles/by/category/:category', ResellerController.panelGetBundlesByCategory);

router.get('/panel/get/promotions/by/category/:category', ResellerController.panelGetPromotionsByCategory);

router.get('/panel/get/banners/by/category/:category', ResellerController.panelGetBannersByCategory);

router.get('/panel/get/categories/bundles', ResellerController.panelGetCategoriesBundles);

router.get('/panel/get/bundles/by/category/:category', ResellerController.panelGetBundlesByCategory);

module.exports = router;
