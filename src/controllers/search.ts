import { Request, Response } from 'express'

import Product from '../models/product/Product'
import ProductMedia from '../models/product/ProductMedia'
import Bundle from '../models/bundle/Bundle'
import Promotion from '../models/promotion/Promotion'
import PromotionMedia from '../models/promotion/PromotionMedia'
import Category from '../models/category/Category'
import CategoryMedia from '../models/category/CategoryMedia'

export async function search(req: Request, res: Response) {
  const query = req.query.query
  const type = req.query.type
  console.log('query:', query)
  console.log('type:', type)

  const finalResult = {}

  if (type === 'all') {
    try {
      const products = await Product.find({
        productName: { $regex: new RegExp(query, 'i') },
      }).populate({
        path: 'media',
        model: ProductMedia,
      })
      const bundles = await Bundle.find({
        bundleName: { $regex: new RegExp(query, 'i') },
      }).populate({
        path: 'products',
        model: Product,
        populate: {
          path: 'media',
          model: ProductMedia,
        },
      })
      const promotions = await Promotion.find({
        promotionName: { $regex: new RegExp(query, 'i') },
      }).populate({
        path: 'media',
        model: PromotionMedia,
      })
      const categories = await Category.find({
        categoryName: { $regex: new RegExp(query, 'i') },
      }).populate({
        path: 'media',
        model: CategoryMedia,
      })
      finalResult.type = 'all'
      finalResult.products = products
      finalResult.bundles = bundles
      finalResult.promotions = promotions
      finalResult.categories = categories
    } catch (err) {
      console.error(err)
    }
  } else if (type === 'products') {
    try {
      const products = await Product.find({
        productName: { $regex: new RegExp(query, 'i') },
      }).populate({
        path: 'media',
        model: ProductMedia,
      })
      finalResult.type = 'products'
      finalResult.products = products
    } catch (err) {
      console.error(err)
    }
  } else if (type === 'bundles') {
    try {
      const bundles = await Bundle.find({
        bundleName: { $regex: new RegExp(query, 'i') },
      }).populate({
        path: 'products',
        model: Product,
        populate: {
          path: 'media',
          model: ProductMedia,
        },
      })
      finalResult.type = 'bundles'
      finalResult.bundles = bundles
    } catch (err) {
      console.error(err)
    }
  } else if (type === 'promotions') {
    try {
      const promotions = await Promotion.find({
        promotionName: { $regex: new RegExp(query, 'i') },
      }).populate({
        path: 'media',
        model: PromotionMedia,
      })
      finalResult.type = 'promotions'
      finalResult.promotions = promotions
    } catch (err) {
      console.error(err)
    }
  } else if (type === 'categories') {
    try {
      const categories = await Category.find({
        categoryName: { $regex: new RegExp(query, 'i') },
      }).populate({
        path: 'media',
        model: CategoryMedia,
      })
      finalResult.type = 'categories'
      finalResult.categories = categories
    } catch (err) {
      console.error(err)
    }
  } else if (type === 'tags') {
  }
  return res.status(200).send(finalResult)
}
