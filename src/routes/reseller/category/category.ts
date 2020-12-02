import { Router } from 'express'

import multer from 'multer'
import multerConfig from '../../../config/multer/multerCategory'

import {
  create,
  deleteMedia,
  index,
  setGlobalVariable,
  sync,
  update,
  updateMedia,
  validateSlug,
  deleteCategory,
  getMedia,
  panelGetSlug,
  upload,
} from '../../../controllers/reseller/category/category'

const router = Router()

router.get('', index)

router.get('/panel/get/:slug', panelGetSlug)

router.get('/sync', sync)

router.get('/validation/slug/:slug', validateSlug)

router.post('/publish', create)

router.put('/update/:id', update)

router.post('/publish/media', multer(multerConfig).single('file'), upload)

router.post('/set/global-variable', setGlobalVariable)

router.get('/get/cover/:id', getMedia)

router.put('/update/cover/:id', updateMedia)

router.put('/delete/category/:categoryId', deleteCategory)

router.put('/delete/media/:id', deleteMedia)

export default router
