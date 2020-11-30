import { Router } from 'express'
import multer from 'multer'
import multerConfig from '../../../config/multer/multerCategory'

import {
  deleteCategory,
  deleteMedia,
  getMedia,
  index,
  panelGetBySlug,
  publish,
  setGlobalVariable,
  sync,
  update,
  updateMedia,
  uploadMedia,
} from '../../../controllers/admin/category/category'

const router = Router()

router.get('', index)

router.get('/panel/get/:slug', panelGetBySlug)

router.get('/sync', sync)

router.get('/validation/slug/:slug')

router.post('/publish', publish)

router.put('/update/:id', update)

router.post('/publish/media', multer(multerConfig).single('file'), uploadMedia)

router.post('/set/global-variable', setGlobalVariable)

router.get('/get/cover/:id', getMedia)

router.put('/update/cover/:id', updateMedia)

router.put('/delete/category/:categoryId', deleteCategory)

router.put('/delete/media/:id', deleteMedia)

export default router
