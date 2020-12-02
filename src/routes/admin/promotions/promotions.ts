import { Router } from 'express'
import multer from 'multer'
import multerConfig from '../../../config/multer/multerPromotion'

import {
  deleteMedia,
  getBySlug,
  index,
  publish,
  setGlobalVariable,
  update,
  uploadMedia,
  validateSlug,
  deletePromotion,
  getAllPromotions,
  getPromotionBySlug,
  panelGetBySlug,
} from '../../../controllers/admin/promotions/promotions'

const router = Router()

router.get('', index)

router.get('/get/all', getAllPromotions)

router.get('/get/slug/:slug', getPromotionBySlug)

router.get('/:slug', getBySlug)

router.get('/validation/slug/:slug', validateSlug)

router.post('/publish', publish)

router.post('/publish/media', multer(multerConfig).single('file'), uploadMedia)

router.post('/set/global-variable', setGlobalVariable)

router.put('/update/:id', update)

router.put('/delete/promotion/:promotionId', deletePromotion)

router.put('/delete/cover/:id', deleteMedia)

router.get('/panel/get/:slug', panelGetBySlug)

export default router
