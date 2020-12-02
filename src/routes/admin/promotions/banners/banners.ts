import { Router } from 'express'
const router = Router()

import {
  panelGetBySlug,
  validateSlug,
  update,
  setGlobalVariable,
  publish,
  index,
  deleteMedia,
  deleteBanner,
  getSlug,
  oldDelete,
} from '../../../../controllers/admin/promotions/banners/banners'

router.get('', index)

router.get('/validation/slug/:slug', validateSlug)

router.post('/publish', publish)

router.post('/set/global-variable', setGlobalVariable)

router.put('/delete/banner/:bannerId', deleteBanner)

router.put('/update/:id', update)

// Delete Podcast
router.delete('/delete/:id', oldDelete)

router.delete('/delete/cover/:id', deleteMedia)

router.get('/panel/get/:slug', panelGetBySlug)

router.get('/:slug', getSlug)

export default router
