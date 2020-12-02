import { Request, Response } from 'express'

import Product from '../models/product/Product'
import ProductComment from '../models/product/ProductComment'
import ProductCommentReply from '../models/product/ProductCommentReply'
import ProductMedia from '../models/product/ProductMedia'
import Reseller from '../models/reseller/Reseller'
import ResellerProfileImage from '../models/reseller/ResellerProfileImage'
import Customer from '../models/customer/Customer'
import CustomerProfileImage from '../models/customer/CustomerProfileImage'
import Category from '../models/category/Category'
import CategoryMedia from '../models/category/CategoryMedia'
import Tag from '../models/tag/Tag'

export async function index(req: Request, res: Response) {
  let productsList = []

  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)

  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const results = {}

  if (endIndex < (await Product.countDocuments().exec())) {
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
    results.results = await Product.find({
      'deletion.isDeleted': false,
    })
      .limit(limit)
      .skip(startIndex)
      .populate({
        path: 'media',
        model: ProductMedia,
      })
      .exec()
    return res.status(200).send(results)
  } catch (err) {
    console.error(err)
  }
}

export async function navbarAll(req: Request, res: Response) {
  let productsList = []
  Product.find()
    .limit(18)
    .then((products) => {
      products.map((product) => {
        productsList.push({
          slug: product.slug,
          productName: product.productName,
        })
      })
      res.json(productsList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function navbarCategory(req: Request, res: Response) {
  const { category: categoryId } = req.params

  console.log('categoryId:', categoryId)

  const categoryObj = await Category.findOne({
    _id: categoryId,
  })

  console.log('categoriesObj:', categoryObj)

  let productsList = []
  Product.find({
    'deletion.isDeleted': false,
    'organization.categories': categoryObj._id,
  })
    .limit(18)
    .then((products) => {
      products.map((product) => {
        productsList.push({
          slug: product.slug,
          productName: product.productName,
        })
      })
      return res.json(productsList)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getProductBySlug(req: Request, res: Response) {
  const { slug } = req.params
  console.log('slug product:', slug)
  Product.findOne({
    slug,
    'deletion.isDeleted': false,
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
      path: 'media',
      model: ProductMedia,
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
      console.log('product found:', product)
      const variantsValues = []
      for (let i = 0; i < product.variants.variantsOptionNames.length; i += 1) {
        variantsValues.push([])
      }
      product.variants.variantsOptionNames.map((name, index) => {
        product.variants.values.map((value) => {
          if (value.active) {
            variantsValues[index].push(value.variantValues[index])
          }
        })
      })
      const uniqueVariantValues = []
      for (let i = 0; i < product.variants.variantsOptionNames.length; i += 1) {
        uniqueVariantValues.push([])
      }
      variantsValues.map((valueArray, index) => {
        uniqueVariantValues[index] = valueArray.filter(
          (v, i, a) => a.indexOf(v) === i,
        )
      })
      res.json({
        prices: {
          price: product.prices.price,
          compareTo: product.prices.compareTo,
        },
        inventory: {
          sku: product.inventory.sku,
          barcode: product.inventory.barcode,
          quantity: product.inventory.quantity,
          allowPurchaseOutOfStock: product.inventory.allowPurchaseOutOfStock,
        },
        shipping: {
          weight: {
            unit: product.shipping.weight.unit,
            amount: product.shipping.weight.amount,
          },
        },
        variants: {
          variantsOptionNames: product.variants.variantsOptionNames,
          values: product.variants.values,
          uniqueValues: uniqueVariantValues,
        },
        seo: {
          title: product.seo.title,
          slug: product.seo.slug,
          description: product.seo.description,
        },
        organization: {
          categories: product.organization.categories,
          tags: product.organization.tags,
        },
        reseller: {
          _id: product.reseller._id,
          isCanadaCannabyssTeam: product.reseller.isCanadaCannabyssTeam,
          names: {
            firstName: product.reseller.names.firstName,
            lastName: product.reseller.names.lastName,
          },
          username: product.reseller.username,
          profileImage: {
            name: product.reseller.profileImage.name,
            url: product.reseller.profileImage.url,
          },
        },
        media: product.media,
        howManyViewed: product.howManyViewed,
        productName: product.productName,
        slug: product.slug,
        taxableProduct: product.taxableProduct,
        description: product.description,
        extraInfo: product.extraInfo,
        _id: product._id,
      })
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getComments(req: Request, res: Response) {
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
        console.log('comment product:', comment.customer.names.firstName)
        commentsList.push({
          replies: comment.replies,
          updatedOn: comment.updatedOn,
          _id: comment._id,
          customer: {
            names: {
              firstName: comment.customer.names.firstName,
              lastName: comment.customer.names.lastName,
            },
            username: comment.customer.customername,
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
  Product.distinct('organization.categories', async (error, results) => {
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

export async function getProductsCategory(req: Request, res: Response) {
  const { category } = req.params
  const categoryObj = await Category.findOne({
    slug: category,
  })

  console.log('category:', category)
  console.log('categoryObj:', categoryObj)

  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)

  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const results = {}

  // const productTestObj = await Product.find({
  //   'organization.categories'
  // })

  console.log(
    'await Product.countDocuments().exec():',
    await Product.find({
      'organization.categories': categoryObj,
    })
      .countDocuments()
      .exec(),
  )

  if (
    endIndex <
    (await Product.find({
      'organization.categories': categoryObj._id,
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
    results.results = await Product.find({
      'organization.categories': categoryObj,
    })
      .limit(limit)
      .skip(startIndex)
      .populate({
        path: 'media',
        model: ProductMedia,
      })
      .exec()
    return res.status(200).send(results)
  } catch (err) {
    console.error(err)
  }
}

export async function getProductsTag(req: Request, res: Response) {
  const { tag } = req.params
  const tagObj = await Tag.findOne({
    slug: tag,
  })

  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)

  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const results = {}

  if (
    endIndex <
    (await Product.find({
      'organization.tag': tagObj._id,
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
    results.results = await Product.find({
      'organization.tags': tagObj._id,
    })
      .limit(limit)
      .skip(startIndex)
      .populate({
        path: 'media',
        model: ProductMedia,
      })
      .exec()
    console.log('products result:', results)
    return res.status(200).send(results)
  } catch (err) {
    console.error(err)
  }
}

export async function updateHowManyViewed(req: Request, res: Response) {
  const { slug } = req.body

  console.log('how many viewed slug:', slug)

  try {
    const product = await Product.findOne({
      slug,
    })

    const howManyViewedNumber = await product.howManyViewed

    await Product.updateOne(
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
