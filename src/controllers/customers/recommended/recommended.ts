import { Request, Response } from 'express'

import Product from '../../../models/product/Product'
import ProductComment from '../../../models/product/ProductComment'
import ProductCommentReply from '../../../models/product/ProductCommentReply'
import ProductMedia from '../../../models/product/ProductMedia'

import Bundle from '../../../models/bundle/Bundle'
import BundleComment from '../../../models/bundle/BundleComment'
import BundleCommentReply from '../../../models/bundle/BundleCommentReply'

export async function products(req: Request, res: Response) {
  //   const { userId } = req.params;

  Product.find()
    .sort({ createdOn: -1 })
    .limit(4)
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .then((products) => {
      return res.status(200).send(products)
    })
    .catch((err) => {
      console.log(err)
    })
}
