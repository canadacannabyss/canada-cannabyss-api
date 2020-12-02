import { Router } from 'express'

import multer from 'multer'
import multerConfig from '../../../config/multer/multer'

import {
  create,
  deleteMedia,
  getBySlug,
  index,
  oldDelete,
  panelGetBySlug,
  setGlobalVariable,
  update,
  uploadMedia,
  validateSlug,
  deleteBundle,
} from '../../../controllers/reseller/bundles/bundles'

const router = Router()

router.get('', index)

router.get('/panel/get/:slug', panelGetBySlug)

router.get('/:slug', getBySlug)

router.get('/validation/slug/:slug', validateSlug)

router.post('/publish', create)

router.post('/publish/media', multer(multerConfig).single('file'), uploadMedia)

router.post('/set/global-variable', setGlobalVariable)

router.put('/update/:id', update)

router.delete('/delete/:id', oldDelete)

router.delete('/delete/bundle/:bundleId', deleteBundle)

router.delete('/delete/cover/:id', deleteMedia)

export default router
