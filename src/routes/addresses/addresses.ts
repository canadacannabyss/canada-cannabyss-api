import { Router } from 'express'
const router = Router()

import {
  getAllCities,
  getAllCitiesFromProvince,
  getAllProvinces,
} from '../../controllers/addresses/addresses'

router.get('/get/all/provinces', getAllProvinces)

router.get('/get/all/cities', getAllCities)

router.get('/get/all/cities/from/:province', getAllCitiesFromProvince)

export default router
