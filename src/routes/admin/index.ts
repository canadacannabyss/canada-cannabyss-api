import express from 'express'

import {
  getAllPromotions,
  getAllBanners,
  getAllBundles,
  getAllProducts,
  getBannersByCategory,
  getBundlesByCategory,
  getCategoriesBanners,
  getCategoriesBundles,
  getCategoriesProducts,
  getCategoriesPromotions,
  getProductsByCategory,
  getPromotionsByCategory,
} from '../../controllers/admin/index'

const router = express.Router()

router.get('/panel/get/all/products', getAllProducts)

router.get('/panel/get/all/bundles', getAllBundles)

router.get('/panel/get/all/promotions', getAllPromotions)

router.get('/panel/get/all/banners', getAllBanners)

router.get('/panel/get/categories/products', getCategoriesProducts)

router.get('/panel/get/categories/promotion', getCategoriesPromotions)

router.get('/panel/get/categories/banner', getCategoriesBanners)

router.get('/panel/get/products/by/category/:category', getProductsByCategory)

router.get('/panel/get/bundles/by/category/:category', getBundlesByCategory)

router.get(
  '/panel/get/promotions/by/category/:category',
  getPromotionsByCategory,
)

router.get('/panel/get/banners/by/category/:category', getBannersByCategory)

router.get('/panel/get/categories/bundles', getCategoriesBundles)

router.get('/panel/get/bundles/by/category/:category', getBundlesByCategory)

export default router
