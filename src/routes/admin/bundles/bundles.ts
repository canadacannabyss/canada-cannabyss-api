import { Router } from 'express'
import multer from 'multer'
import multerConfig from '../../../config/multer/multer'
import _ from 'lodash'

const router = Router()

import {
  deleteBundle,
  getBundleBySlug,
  index,
  panelGetBundleBySlug,
  publish,
  setGlobalVariable,
  updateBundle,
  uploadMedia,
  validateSlug,
} from '../../../controllers/admin/bundles/bundles'

router.get('', index)

router.get('/panel/get/:slug', panelGetBundleBySlug)

router.get('/:slug', getBundleBySlug)

router.get('/validation/slug/:slug', validateSlug)

router.post('/publish', publish)

router.post('/publish/media', multer(multerConfig).single('file'), uploadMedia)

router.post('/set/global-variable', setGlobalVariable)

router.put('/update/:id', updateBundle)

router.put('/delete/bundle/:bundleId', deleteBundle)

module.exports = router
