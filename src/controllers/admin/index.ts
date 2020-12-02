import { Request, Response } from 'express'
import { v4 } from 'uuid'
import multer from 'multer'
import multerConfig from '../../config/multer/multer'
import slugify from 'slugify'
import _ from 'lodash'

import Product from '../../models/product/Product'
import ProductMedia from '../../models/product/ProductMedia'
import Category from '../../models/category/Category'
import CategoryMedia from '../../models/category/CategoryMedia'
import Bundle from '../../models/bundle/Bundle'
import Promotion from '../../models/promotion/Promotion'
import PromotionMedia from '../../models/promotion/PromotionMedia'
import Banner from '../../models/banner/Banner'

export async function getAllProducts(req: Request, res: Response) {
  Product.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .then((products) => {
      return res.status(200).send(products)
    })
    .catch((err) => {
      console.log(err)
      return res.status(500).send(err)
    })
}

export async function getAllBundles(req: Request, res: Response) {
  Bundle.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'products',
      model: Product,
      populate: {
        path: 'media',
        model: ProductMedia,
      },
    })
    .then((bundles) => {
      return res.status(200).send(bundles)
    })
    .catch((err) => {
      console.log(err)
      return res.status(500).send(err)
    })
}

export async function getAllPromotions(req: Request, res: Response) {
  Promotion.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: PromotionMedia,
    })
    .then((promotions) => {
      return res.status(200).send(promotions)
    })
    .catch((err) => {
      console.log(err)
      return res.status(500).send(err)
    })
}

export async function getAllBanners(req: Request, res: Response) {
  Banner.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'promotions',
      model: Promotion,
      populate: {
        path: 'media',
        model: PromotionMedia,
      },
    })
    .then((banners) => {
      return res.status(200).send(banners)
    })
    .catch((err) => {
      console.log(err)
      return res.status(500).send(err)
    })
}

export async function getCategoriesProducts(req: Request, res: Response) {
  Category.find({
    'deletion.isDeleted': false,
  })
    // .sort({howManyViewed: 1})
    .then((categories) => {
      let categoriesList = []
      categories.map((category) => {
        categoriesList.push({
          categoryName: category.categoryName,
          slug: category.slug,
        })
      })
      console.log(categoriesList)
      return res.json(categoriesList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getCategoriesPromotions(req: Request, res: Response) {
  Category.find({
    'deletion.isDeleted': false,
  })
    // .sort({howManyViewed: 1})
    .then((categories) => {
      let categoriesList = []
      categories.map((category) => {
        categoriesList.push({
          categoryName: category.categoryName,
          slug: category.slug,
        })
      })
      console.log(categoriesList)
      return res.json(categoriesList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getCategoriesBanners(req: Request, res: Response) {
  Category.find({
    'deletion.isDeleted': false,
  })
    // .sort({howManyViewed: 1})
    .then((categories) => {
      let categoriesList = []
      categories.map((category) => {
        categoriesList.push({
          categoryName: category.categoryName,
          slug: category.slug,
        })
      })
      console.log(categoriesList)
      return res.json(categoriesList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getProductsByCategory(req: Request, res: Response) {
  const { category } = req.params

  Product.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .populate({
      path: 'organization.category',
      model: Category,
    })
    .then((products) => {
      let productsList = []
      products.map((product) => {
        if (product.organization.category !== null) {
          if (product.organization.category.slug === category) {
            productsList.push(product)
          }
        }
      })
      return res.status(200).send(productsList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getBundlesByCategory(req: Request, res: Response) {
  const { category } = req.params
  Bundle.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'products',
      model: Product,
      populate: {
        path: 'media',
        model: ProductMedia,
      },
    })
    .populate({
      path: 'organization.category',
      model: Category,
    })
    .then((bundles) => {
      let bundlesList = []
      bundles.map((bundle) => {
        if (bundle.organization.category !== null) {
          if (bundle.organization.category.slug === category) {
            bundlesList.push(bundle)
          }
        }
      })
      return res.status(200).send(bundlesList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getPromotionsByCategory(req: Request, res: Response) {
  const { category } = req.params
  Promotion.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: PromotionMedia,
    })
    .populate({
      path: 'organization.category',
      model: Category,
    })
    .then((promotions) => {
      let promotionsList = []
      promotions.map((promotion) => {
        console.log('promotions:', promotions)
        if (promotion.organization.category !== null) {
          if (promotion.organization.category.slug === category) {
            promotionsList.push(promotion)
          }
        }
      })
      return res.status(200).send(promotionsList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getBannersByCategory(req: Request, res: Response) {
  const { category } = req.params
  Banner.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'promotions',
      model: Promotion,
      populate: {
        path: 'media',
        model: PromotionMedia,
      },
    })
    .populate({
      path: 'organization.category',
      model: Category,
    })
    .then((banners) => {
      let bannersList = []
      banners.map((banner) => {
        if (banner.organization.category !== null) {
          if (banner.organization.category.slug === category) {
            bannersList.push(banner)
          }
        }
      })
      return res.status(200).send(bannersList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getCategoriesBundles(req: Request, res: Response) {
  Category.find({
    'deletion.isDeleted': false,
  })
    // .sort({howManyViewed: 1})
    .then((categories) => {
      let categoriesList = []
      categories.map((category) => {
        categoriesList.push({
          categoryName: category.categoryName,
          slug: category.slug,
        })
      })
      console.log(categoriesList)
      return res.json(categoriesList)
    })
    .catch((err) => {
      console.log(err)
    })
}
