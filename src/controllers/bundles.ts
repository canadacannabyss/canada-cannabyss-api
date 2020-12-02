import { Request, Response } from 'express'

import Product from '../models/product/Product'
import ProductMedia from '../models/product/ProductMedia'
import Bundle from '../models/bundle/Bundle'
import BundleComment from '../models/bundle/BundleComment'
import Reseller from '../models/reseller/Reseller'
import ResellerProfileImage from '../models/reseller/ResellerProfileImage'
import Customer from '../models/customer/Customer'
import CustomerProfileImage from '../models/customer/CustomerProfileImage'
import Category from '../models/category/Category'
import Tag from '../models/tag/Tag'

export async function index(req: Request, res: Response) {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)

  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const results = {}

  if (endIndex < (await Bundle.countDocuments().exec())) {
    results.next = {
      page: page + 1,
      limit: limit,
    }
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    }
  }

  try {
    results.results = await Bundle.find({
      'deletion.isDeleted': false,
    })
      .limit(limit)
      .skip(startIndex)
      .populate({
        path: 'products',
        model: Product,
        populate: {
          path: 'media',
          model: ProductMedia,
        },
      })
      .exec()
    return res.status(200).send(results)
  } catch (err) {
    console.error(err)
  }
}

export async function navbarAll(req: Request, res: Response) {
  let bundlesList = []
  Bundle.find()
    .limit(18)
    .then((bundles) => {
      bundles.map((bundle) => {
        bundlesList.push({
          slug: bundle.slug,
          bundleName: bundle.bundleName,
        })
      })
      return res.json(bundlesList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function navbarCategory(req: Request, res: Response) {
  const { category: categoryId } = req.params

  const categoryObj = await Category.findOne({
    _id: categoryId,
  })

  let bundlesList = []
  Bundle.find({
    'organization.categories': categoryObj._id,
  })
    .limit(18)
    .then((bundles) => {
      bundles.map((bundle) => {
        bundlesList.push({
          slug: bundle.slug,
          bundleName: bundle.bundleName,
        })
      })
      return res.json(bundlesList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getBundleSlug(req: Request, res: Response) {
  const { slug } = req.params
  console.log('slug product:', slug)
  Bundle.findOne({
    slug,
  })
    .populate({
      path: 'reseller',
      model: Reseller,
      populate: {
        path: 'profileImage',
        model: ResellerProfileImage,
      },
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
      path: 'organization.categories',
      model: Category,
    })
    .populate({
      path: 'organization.tags',
      model: Tag,
    })
    .then((product) => {
      return res.json(product)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getComment(req: Request, res: Response) {
  const { bundleId } = req.params

  let commentsList = []

  BundleComment.find({
    bundle: bundleId,
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
        console.log('comment bundle:', comment)
        commentsList.push({
          replies: comment.replies,
          updatedOn: comment.updatedOn,
          _id: comment._id,
          customer: {
            names: {
              firstName: comment.customer.names.firstName,
              lastName: comment.customer.names.lastName,
            },
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

export async function getCategories(req: Request, res: Response) {
  let categoriesList = []
  Bundle.distinct('organization.categories', async (error, results) => {
    const categories = await Category.find({
      _id: results,
    })
    categories.map((category) => {
      categoriesList.push({
        id: category._id,
        categoryName: category.categoryName,
        slug: category.slug,
      })
    })
    return res.status(200).send(categoriesList)
  })
}

export async function getBundlesCategory(req: Request, res: Response) {
  const { category } = req.params
  const categoryObj = await Category.findOne({
    slug: category,
  })

  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)

  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const results = {}

  if (
    endIndex <
    (await Bundle.find({
      'organization.category': categoryObj._id,
    })
      .countDocuments()
      .exec())
  ) {
    results.next = {
      page: page + 1,
      limit: limit,
    }
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    }
  }

  try {
    results.results = await Bundle.find({
      'organization.category': categoryObj._id,
    })
      .limit(limit)
      .skip(startIndex)
      .populate({
        path: 'products',
        model: Product,
        populate: {
          path: 'media',
          model: ProductMedia,
        },
      })
      .exec()
    return res.status(200).send(results)
  } catch (err) {
    console.error(err)
  }
}

export async function updateHowManyViewed(req: Request, res: Response) {
  const { slug } = req.body

  try {
    const bundle = await Bundle.findOne({
      slug,
    })

    const howManyViewedNumber = await bundle.howManyViewed

    await Bundle.updateOne(
      {
        slug,
      },
      {
        howManyViewed: howManyViewedNumber + 1,
      },
      {
        runValidators: true,
      },
    )
    return res
      .status(200)
      .send({ howManyViewedNumber: howManyViewedNumber + 1 })
  } catch (err) {
    console.log(err)
  }
}
