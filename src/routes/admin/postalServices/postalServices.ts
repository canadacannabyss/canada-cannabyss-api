import { Router } from 'express'
const router = Router()

import {
  index,
  create,
  edit,
  deletePostalService,
  getBySlug,
  validatePostalServiceName,
} from '../../../controllers/admin/postalServices/postalServices'

router.get('', index)

router.get(
  '/validate/postal-service/:postalServiceName',
  validatePostalServiceName,
)

router.get('/:slug', getBySlug)

router.post('/create', create)

router.put('/edit', edit)

router.put('/delete/postal-service/:postalServiceId', deletePostalService)

export default router
