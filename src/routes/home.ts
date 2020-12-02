import { Router } from 'express'
const router = Router()

import {
  getComment,
  getProductSlug,
  mainBanners,
  mainBundles,
  mainCategories,
  mainMostBought,
  mainNewestProducts,
  mainProducts,
} from '../controllers/home'

router.get('/main/products', mainProducts)

router.get('/main/bundles', mainBundles)

router.get('/main/banners', mainBanners)

router.get('/main/most-bought', mainMostBought)

router.get('/main/category', mainCategories)

router.get('/main/newest/products', mainNewestProducts)

router.get('/get/product/:slug', getProductSlug)

router.get('/get/comments/:productId', getComment)

export default router
