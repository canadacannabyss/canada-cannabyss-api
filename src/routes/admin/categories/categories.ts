import { Router } from 'express'
import multer from 'multer'
import multerConfig from '../../../config/multer/multerCategory'

import {
  deleteCategory,
  deleteMedia,
  validateSlug,
  uploadMedia,
  setGlobalVariable,
  publish,
  index,
  getMedia,
  panelGetBySlug,
  sync,
  update,
  updateMedia,
} from '../../../controllers/admin/categories/categories'
const router = Router()

router.get('', index)

router.get('/panel/get/:slug', panelGetBySlug)

router.get('/sync', sync)

router.get('/validation/slug/:slug', validateSlug)

router.post('/publish', publish)

router.put('/update/:id', update)

router.post('/publish/media', multer(multerConfig).single('file'), uploadMedia)

router.post('/set/global-variable', setGlobalVariable)

// Update Category Cover
router.get('/get/cover/:id', getMedia)

// Update Category Cover
router.put('/update/cover/:id', updateMedia)

// Delete Category
router.delete('/delete/category/:categoryId', deleteCategory)

// Delete Category Cover
router.delete('/delete/media/:id', deleteMedia)

module.exports = router
