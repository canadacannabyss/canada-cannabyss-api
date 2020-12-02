import { Request, Response } from 'express'

import Product from '../models/product/Product'
import ProductMedia from '../models/product/ProductMedia'
import Bundle from '../models/bundle/Bundle'

export async function productProducts(req: Request, res: Response) {
  const { userId } = req.params
  Product.find({
    reseller: userId,
  })
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .limit(4)
    .then((products) => {
      return res.status(200).send(products)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function bundleBundles(req: Request, res: Response) {
  const { userId } = req.params
  Bundle.find({
    reseller: userId,
  })
    .populate({
      path: 'products',
      model: Product,
      populate: {
        path: 'media',
        model: ProductMedia,
      },
    })
    .limit(4)
    .then((products) => {
      return res.status(200).send(products)
    })
    .catch((err) => {
      console.log(err)
    })
}
