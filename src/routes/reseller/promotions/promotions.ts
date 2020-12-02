import { Router } from 'express'
import multer from 'multer'
import multerConfig from '../../../config/multer/multerPromotion'

import {
  uploadMedia,
  deleteMedia,
  validateSlug,
  create,
  getBySlug,
  index,
  update,
  panelGetSlug,
  setGlobalVariable,
  oldDelete,
  deletePromotion,
  getAll,
  slug,
} from '../../../controllers/reseller/promotions/promotions'

const router = Router()

router.get('', index)

router.get('/get/all', getAll)

router.get('/get/slug/:slug', getBySlug)

router.get('/:slug', slug)

router.get('/validation/slug/:slug', validateSlug)

router.post('/publish', create)

router.post('/publish/media', multer(multerConfig).single('file'), uploadMedia)

router.post('/set/global-variable', setGlobalVariable)

router.put('/update/:id', update)

router.delete('/delete/promotion/:promotionId', deletePromotion)

router.delete('/delete/:id', oldDelete)

router.delete('/delete/cover/:id', deleteMedia)

router.get('/panel/get/:slug', panelGetSlug)

export default router
