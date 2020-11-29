import { Request, Response } from 'express'
import Canada from '../../utils/addresses/canada'

const canada = new Canada()

export function getAllProvinces(req: Request, res: Response) {
  return res.status(200).send(canada.getAllProvinces())
}

export function getAllCities(req: Request, res: Response) {
  return res.status(200).send(canada.getAllCities())
}

export function getAllCitiesFromProvince(req: Request, res: Response) {
  const { province } = req.params

  let citiesArray = canada.getAllCities()
  let result = citiesArray
    .filter((item) => {
      return item[1] === province
    })
    .map((a) => {
      return a[0]
    })
  return res.status(200).send(result)
}
