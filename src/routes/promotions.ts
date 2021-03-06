import { Router } from 'express'
import multer from 'multer'

import multerConfig from '../config/multer/multerPromotion'
import {
  create,
  index,
  oldDelete,
  setGlobalVariable,
  update,
  validateSlug,
  uploadMedia,
  getBySlug,
  oldDeleteMedia,
} from '../controllers/promotions'

const router = Router()

router.get('/get/all', index)

router.get('/get/slug/:slug', getBySlug)

router.get('/validation/slug/:slug', validateSlug)

router.post('/publish', create)

router.post('/publish/media', multer(multerConfig).single('file'), uploadMedia)

router.post('/set/global-variable', setGlobalVariable)

router.put('/update/:id', update)

router.delete('/delete/:id', oldDelete)

router.delete('/delete/cover/:id', oldDeleteMedia)

export default router
