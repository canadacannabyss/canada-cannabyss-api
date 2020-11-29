import { Router } from 'express'
import multer from 'multer'

import multerConfig from '../config/multer/multerPromotion'
import PromotionsController from '../controllers/promotions'

const router = Router()

router.get('/get/all', PromotionsController.index)

router.get('/get/slug/:slug', PromotionsController.getBySlug)

router.get('/validation/slug/:slug', PromotionsController.validateSlug)

router.post('/publish', PromotionsController.create)

router.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  PromotionsController.uploadMedia,
)

router.post('/set/global-variable', PromotionsController.setGlobalVariable)

router.put('/update/:id', PromotionsController.update)

router.delete('/delete/:id', PromotionsController.oldDelete)

router.delete('/delete/cover/:id', PromotionsController.oldDeleteMedia)

export default router
