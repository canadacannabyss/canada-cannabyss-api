import { Router } from 'express'

import {
  oldDelete,
  setGlobalVariable,
  panelGetSlug,
  update,
  index,
  getBySlug,
  create,
  validateSlug,
  oldDeleteMedia,
  deleteBanner,
} from '../../../../controllers/reseller/promotions/banners/banners'

const router = Router()

router.get('', index)

router.get('/validation/slug/:slug', validateSlug)

router.post('/publish', create)

router.post('/set/global-variable', setGlobalVariable)

router.delete('/delete/banner/:bannerId', deleteBanner)

router.put('/update/:id', update)

router.delete('/delete/:id', oldDelete)

router.delete('/delete/cover/:id', oldDeleteMedia)

router.get('/panel/get/:slug', panelGetSlug)

router.get('/:slug', getBySlug)

export default router
