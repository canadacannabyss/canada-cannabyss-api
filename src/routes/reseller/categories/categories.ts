import { Router } from 'express'
import multer from 'multer'

import multerConfig from '../../../config/multer/multerCategory'
import {
  validateSlug,
  uploadMedia,
  update,
  setGlobalVariable,
  panelGetBySlug,
  index,
  deleteMedia,
  create,
  deleteCategory,
  getMediaById,
  sync,
  updateMedia,
} from '../../../controllers/reseller/categories/categories'

const router = Router()

router.get('', index)

router.get('/panel/get/:slug', panelGetBySlug)

router.get('/sync', sync)

// Check if Podcast slug is valid
router.get('/validation/slug/:slug', validateSlug)

router.post('/publish', create)

router.put('/update/:id', update)

router.post('/publish/media', multer(multerConfig).single('file'), uploadMedia)

router.post('/set/global-variable', setGlobalVariable)

router.get('/get/cover/:id', getMediaById)

router.put('/update/cover/:id', updateMedia)

router.delete('/delete/category/:categoryId', deleteCategory)

router.delete('/delete/media/:id', deleteMedia)

export default router
