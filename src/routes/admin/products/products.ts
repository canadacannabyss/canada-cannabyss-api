import { Router } from 'express'
import multer from 'multer'
import multerConfig from '../../../config/multer/multer'

import {
  index,
  deleteMedia,
  deleteProduct,
  getBundleProducts,
  getProductBySlug,
  panelGetProductBySlug,
  publish,
  setGlobalVariable,
  updateProduct,
  uploadMedia,
  validateSlug,
} from '../../../controllers/admin/products/products'

const router = Router()

router.get('', index)

router.get('/bundle/products', getBundleProducts)

router.get('/panel/get/:slug', panelGetProductBySlug)

router.get('/validation/slug/:slug', validateSlug)

router.post('/publish', publish)

router.post('/publish/media', multer(multerConfig).single('file'), uploadMedia)

router.post('/set/global-variable', setGlobalVariable)

router.put('/update/:id', updateProduct)

router.get('/:slug', getProductBySlug)

router.put('/delete/product/:productId', deleteProduct)

router.put('/delete/cover/:id', deleteMedia)

export default router
