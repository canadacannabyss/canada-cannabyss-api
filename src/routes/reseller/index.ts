import { Router } from 'express'

import {
  panelGetAllBanners,
  panelGetAllBundles,
  panelGetAllProducts,
  panelGetAllPromotions,
  panelGetBannersByCategory,
  panelGetBundlesByCategory,
  panelGetCategoriesBanners,
  panelGetCategoriesBundles,
  panelGetCategoriesProducts,
  panelGetCategoriesPromotions,
  panelGetProductsByCategory,
  panelGetPromotionsByCategory,
} from '../../controllers/reseller/index'

const router = Router()

router.get('/panel/get/all/products', panelGetAllProducts)

router.get('/panel/get/all/bundles', panelGetAllBundles)

router.get('/panel/get/all/promotions', panelGetAllPromotions)

router.get('/panel/get/all/banners', panelGetAllBanners)

router.get('/panel/get/categories/products', panelGetCategoriesProducts)

router.get('/panel/get/categories/promotion', panelGetCategoriesPromotions)

router.get('/panel/get/categories/banner', panelGetCategoriesBanners)

router.get(
  '/panel/get/products/by/category/:category',
  panelGetProductsByCategory,
)

router.get(
  '/panel/get/bundles/by/category/:category',
  panelGetBundlesByCategory,
)

router.get(
  '/panel/get/promotions/by/category/:category',
  panelGetPromotionsByCategory,
)

router.get(
  '/panel/get/banners/by/category/:category',
  panelGetBannersByCategory,
)

router.get('/panel/get/categories/bundles', panelGetCategoriesBundles)

router.get(
  '/panel/get/bundles/by/category/:category',
  panelGetBundlesByCategory,
)

export default router
