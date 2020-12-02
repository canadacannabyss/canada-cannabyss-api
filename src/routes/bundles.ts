/* eslint-disable array-callback-return */
import { Router } from 'express'
const router = Router()

import {
  index,
  getBundleSlug,
  getBundlesCategory,
  getCategories,
  getComment,
  navbarAll,
  navbarCategory,
  updateHowManyViewed,
} from '../controllers/bundles'

router.get('', index)

router.get('/navbar/all', navbarAll)

router.get('/navbar/category/:category', navbarCategory)

router.get('/get/bundle/:slug', getBundleSlug)

router.get('/get/comments/:bundleId', getComment)

router.get('/get/categories', getCategories)

router.get('/get/bundles/category/:category', getBundlesCategory)

router.put('/update/how-many-viewed', updateHowManyViewed)

export default router
