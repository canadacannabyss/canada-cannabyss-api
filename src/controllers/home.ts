import { Request, Response } from 'express'

import Product from '../models/product/Product'
import ProductComment from '../models/product/ProductComment'
import ProductCommentReply from '../models/product/ProductCommentReply'
import ProductMedia from '../models/product/ProductMedia'
import Bundle from '../models/bundle/Bundle'
import Customer from '../models/customer/Customer'
import CustomerProfileImage from '../models/customer/CustomerProfileImage'
import Category from '../models/category/Category'
import CategoryMedia from '../models/category/CategoryMedia'
import Banner from '../models/banner/Banner'
import Promotion from '../models/promotion/Promotion'
import PromotionMedia from '../models/promotion/PromotionMedia'

export async function mainProducts(req: Request, res: Response) {
  let productsList = []
  Product.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .limit(5)
    .then((products) => {
      products.map((product) => {
        productsList.push({
          id: product._id,
          productName: product.productName,
          slug: product.slug,
          prices: {
            price: product.prices.price,
            compareTo: product.prices.compareTo,
          },
          media: {
            url: product.media[0].url,
          },
        })
      })
      return res.json(productsList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function mainBundles(req: Request, res: Response) {
  let bundlesList = []
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
    .limit(5)
    .then((bundles) => {
      bundles.map((bundle) => {
        let bundleProductList = []
        bundle.products.map((product) => {
          bundleProductList.push({
            media: {
              url: product.media[0].url,
            },
          })
        })
        bundlesList.push({
          id: bundle._id,
          bundleName: bundle.bundleName,
          slug: bundle.slug,
          prices: {
            price: bundle.prices.price,
            compareTo: bundle.prices.compareTo,
          },
          products: bundleProductList,
        })
      })
      return res.json(bundlesList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function mainBanners(req: Request, res: Response) {
  Banner.find({
    featured: true,
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
    .then((banner) => {
      return res.status(200).send(banner)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function mainMostBought(req: Request, res: Response) {
  Product.find()
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .sort([['howManyBought', -1]])
    .limit(8)
    .then((products) => {
      const productsList = products.map((product) => {
        return {
          id: product._id,
          productName: product.productName,
          slug: product.slug,
          prices: {
            price: product.prices.price,
            compareTo: product.prices.compareTo,
          },
          media: {
            url: product.media[0].url,
          },
        }
      })
      console.log('produicts:', products)
      return res.status(200).send(productsList)
    })
    .catch((err) => {
      console.error(err)
    })
}

export async function mainCategories(req: Request, res: Response) {
  Category.find({
    featured: true,
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: CategoryMedia,
    })
    .sort({
      createdAt: -1,
    })
    .limit(8)
    .then((categories) => {
      return res.json(categories)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function mainNewestProducts(req: Request, res: Response) {
  let productsList = []
  Product.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .limit(4)
    .sort({
      createdAt: -1,
    })
    .then((products) => {
      products.map((product) => {
        productsList.push({
          id: product._id,
          productName: product.productName,
          slug: product.slug,
          prices: {
            price: product.prices.price,
            compareTo: product.prices.compareTo,
          },
          media: {
            url: product.media[0].url,
          },
        })
      })
      return res.json(productsList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getProductSlug(req: Request, res: Response) {
  const { slug } = req.params
  console.log('slug product:', slug)
  Product.findOne({
    slug,
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .then((product) => {
      return res.json(product)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getComment(req: Request, res: Response) {
  const { productId } = req.params

  let commentsList = []

  ProductComment.find({
    product: productId,
  })
    .populate({
      path: 'customer',
      model: Customer,
      populate: {
        path: 'profileImage',
        model: CustomerProfileImage,
      },
    })
    .sort({
      createdAt: '-1',
    })
    .then((comments) => {
      comments.map((comment) => {
        commentsList.push({
          replies: comment.replies,
          updatedOn: comment.updatedOn,
          _id: comment._id,
          customer: {
            name: comment.customer.name,
            username: comment.customer.username,
            profileImage: {
              url: comment.customer.profileImage.url,
            },
          },
          content: comment.content,
          createdAt: comment.createdAt,
          likes: comment.likes,
          dislikes: comment.dislikes,
        })
      })
      return res.json(commentsList)
    })
    .catch((err) => {
      console.log(err)
    })
}
