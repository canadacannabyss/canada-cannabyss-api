import { Router } from 'express'
import multer from 'multer'
import multerConfig from '../../../config/multer/multer'

import {
  update,
  index,
  getBySlug,
  create,
  validateSlug,
  deleteMedia,
  deleteProduct,
  panelGetBySlug,
  uploadMedia,
  seetGlobalVariable,
} from '../../../controllers/reseller/products/products'

const router = Router()

router.get('', index)

router.get('/panel/get/:slug', panelGetBySlug)

router.get('/validation/slug/:slug', validateSlug)

router.post('/publish', create)

router.post('/publish/media', multer(multerConfig).single('file'), uploadMedia)

router.post('/set/global-variable', seetGlobalVariable)

router.put('/update/:id', update)

router.get('/:slug', getBySlug)

router.delete('/delete/product/:productId', deleteProduct)

router.delete('/delete/cover/:id', deleteMedia)

export default router
