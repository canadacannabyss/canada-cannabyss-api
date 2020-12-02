import { Router } from 'express'
import {
  index,
  updateHowManyViewed,
  navbarCategory,
  navbarAll,
  getCategories,
  getProductBySlug,
  getComments,
  getProductsCategory,
  getProductsTag,
} from '../controllers/products'

const router = Router()

router.get('', index)

router.get('/navbar/all', navbarAll)

router.get('/navbar/category/:category', navbarCategory)

router.get('/get/product/:slug', getProductBySlug)

router.get('/get/comments/:productId', getComments)

router.get('/get/categories', getCategories)

router.get('/get/products/category/:category', getProductsCategory)

router.get('/get/products/tag/:tag', getProductsTag)

router.put('/update/how-many-viewed', updateHowManyViewed)

export default router
