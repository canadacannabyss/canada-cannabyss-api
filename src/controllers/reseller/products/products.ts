import { Request, Response } from 'express'
import { v4 } from 'uuid'
import _ from 'lodash'

import { slugifyString, generateRandomSlug } from '../../../utils/strings/slug'
import {
  getCategory,
  createCategory,
} from '../../../utils/categories/categories'
import { getTag, createTag } from '../../../utils/tags/tags'

import Product from '../../../models/product/Product'
import ProductMedia from '../../../models/product/ProductMedia'
import Category from '../../../models/category/Category'
import CategoryMedia from '../../../models/category/CategoryMedia'
import Tag from '../../../models/tag/Tag'

const verifyValidSlug = async (slug) => {
  try {
    const product = await Product.find({
      slug,
    })
    console.log('product:', product)
    if (!_.isEmpty(product)) {
      return false
    } else {
      return true
    }
  } catch (err) {
    console.log(err)
  }
}

export async function index(req: Request, res: Response) {
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
      console.error(err)
    })
}

export async function panelGetBySlug(req: Request, res: Response) {
  const { slug } = req.params
  Product.findOne({
    slug,
  })
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .populate({
      path: 'organization.category',
      model: Category,
      populate: {
        path: 'media',
        model: CategoryMedia,
      },
    })
    .then((product) => {
      return res.json(product)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function validateSlug(req: Request, res: Response) {
  const { slug } = req.params
  const verificationRes = verifyValidSlug(slug)
  return res.json({
    valid: verificationRes,
  })
}

export async function create(req: Request, res: Response) {
  const {
    resellerId,
    media,
    isSlugValid,
    variants,
    productName,
    prices,
    taxableProduct,
    description,
    extraInfo,
    inventory,
    shipping,
    seo,
    organization,
  } = req.body

  console.log('resellerId:', resellerId)

  let slug = slugifyString(productName)

  if (!(await verifyValidSlug(slug))) {
    slug = await generateRandomSlug(slug)
  }

  if (await verifyValidSlug(slug)) {
    try {
      const promisesCategories = organization.categories.map(
        async (category) => {
          let categoryObj = await getCategory(category)

          if (_.isEmpty(categoryObj)) {
            categoryObj = await createCategory(category, resellerId)
          }
          return categoryObj
        },
      )

      const resultsAsyncCategoriesArray = await Promise.all(promisesCategories)

      const promisesTags = organization.tags.map(async (tag) => {
        let tagObj = await getTag(tag)

        if (_.isEmpty(tagObj)) {
          tagObj = await createTag(tag)
        }
        return tagObj
      })

      const resultsAsyncTagsArray = await Promise.all(promisesTags)

      const newProduct = new Product({
        reseller: resellerId,
        media,
        variants,
        productName,
        slug,
        prices,
        taxableProduct,
        description,
        extraInfo,
        inventory,
        shipping: {
          physicalProduct: shipping.physicalProduct,
          weight: {
            unit: shipping.weight.unit,
            amount: shipping.weight.amount,
          },
        },
        seo,
        organization: {
          categories: resultsAsyncCategoriesArray,
          tags: resultsAsyncTagsArray,
        },
      })

      newProduct
        .save()
        .then((product) => {
          return res.status(201).send({
            slug: product.slug,
          })
        })
        .catch((err) => {
          console.log(err)
        })
    } catch (err) {
      console.log(err)
    }
  } else {
    return res.json({ error: 'The provided slug is invalid' })
  }
}

export async function uploadMedia(req: Request, res: Response) {
  try {
    const { originalname: name, size, key, location: url = '' } = req.file
    const id = v4()

    console.log(name, size, key, url)

    const productMedia = await ProductMedia.create({
      id,
      name,
      size,
      key,
      url,
    })

    return res.json(productMedia)
  } catch (err) {
    console.log(err)
  }
}

export async function seetGlobalVariable(req: Request, res: Response) {
  const { type, title } = req.body
  global.gConfigMulter.type = type
  global.gConfigMulter.title = title
  global.gConfigMulter.folder_name = global.gConfigMulter.title
  global.gConfigMulter.destination = `${global.gConfigMulter.type}/${global.gConfigMulter.folder_name}`
  return res.status(200).send({
    ok: true,
  })
}

export async function update(req: Request, res: Response) {
  const {
    media,
    resellerId,
    productName,
    prices,
    taxableProduct,
    description,
    extraInfo,
    inventory,
    shipping,
    variants,
    seo,
    organization,
  } = req.body
  const { id } = req.params

  let slug = slugifyString(productName)

  if (!(await verifyValidSlug(slug))) {
    slug = await generateRandomSlug(slug)
  }
  try {
    let newMedia = []
    const productObj = await Product.findOne({
      _id: id,
    })
    if (media === undefined) {
      newMedia = productObj.media
    } else {
      newMedia = media
      if (productObj.slug !== slug) {
        productObj.media.map(async (image) => {
          const productMediaObj = await ProductMedia.findOne({
            _id: image,
          })
          productMediaObj.remove()
        })
      }
    }

    const promisesCategories = organization.categories.map(async (category) => {
      let categoryObj = await getCategory(category)

      if (_.isEmpty(categoryObj)) {
        categoryObj = await createCategory(category, resellerId)
      }
      return categoryObj
    })

    const resultsAsyncCategoriesArray = await Promise.all(promisesCategories)

    const promisesTags = organization.tags.map(async (tag) => {
      let tagObj = await getTag(tag)

      if (_.isEmpty(tagObj)) {
        tagObj = await createTag(tag)
      }
      return tagObj
    })

    const resultsAsyncTagsArray = await Promise.all(promisesTags)

    await Product.findOneAndUpdate(
      {
        _id: id,
      },
      {
        media: newMedia,
        reseller: resellerId,
        productName: productName,
        slug: slug,
        prices: {
          price: prices.price,
          compareTo: prices.compareTo,
        },
        taxableProduct: taxableProduct,
        description: description,
        extraInfo: extraInfo,
        inventory: {
          sku: inventory.sku,
          barcode: inventory.barcode,
          quantity: inventory.quantity,
          allowPurchaseOutOfStock: inventory.allowPurchaseOutOfStock,
        },
        shipping: {
          physicalProduct: shipping.physicalProduct,
          weight: {
            unit: shipping.weight.unit,
            amount: shipping.weight.amount,
          },
        },
        variants: {
          variantsOptionNames: variants.variantsOptionNames,
          values: variants.values,
        },
        seo: {
          title: seo.title,
          slug: seo.slug,
          description: seo.description,
        },
        organization: {
          categories: resultsAsyncCategoriesArray,
          tags: resultsAsyncTagsArray,
        },
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      },
    )

    const newUpdatedProduct = await Product.findOne({
      _id: id,
    })
    return res.status(200).send({
      slug: newUpdatedProduct.slug,
    })
  } catch (err) {
    console.log(err)
  }
}

export async function getBySlug(req: Request, res: Response) {
  const { slug } = req.params

  console.log('slug:', slug)

  Product.findOne({
    slug: slug,
    'deletion.isDeleted': false,
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
      const errors = []
      if (!product) errors.push({ error: 'Product not found' })

      if (errors.length > 0) {
        return res.status(400).send(errors)
      } else {
        return res.status(200).send(product)
      }
    })
    .catch((err) => {
      console.log(err)
      return res.status(400).send({ error: 'Server error' })
    })
}

export async function deleteProduct(req: Request, res: Response) {
  const { productId } = req.params

  Product.findOne({
    _id: productId,
  }).then((product) => {
    product.media.map(async (media) => {
      await ProductMedia.findOneAndUpdate(
        {
          _id: media,
        },
        {
          'deletion.isDeleted': true,
          'deletion.when': Date.now(),
        },
        {
          runValidators: true,
        },
      )
    })

    product
      .updateOne(
        {
          'deletion.isDeleted': true,
          'deletion.when': Date.now(),
        },
        {
          runValidators: true,
        },
      )
      .then(() => {
        return res.status(200).send({ ok: true })
      })
      .catch((err) => {
        console.error(err)
      })
  })
}

export async function deleteMedia(req: Request, res: Response) {
  const { id } = req.params

  ProductMedia.findOneAndUpdate(
    {
      _id: id,
    },
    {
      'deletion.isDeleted': true,
      'deletion.when': Date.now(),
    },
    {
      runValidators: true,
    },
  )
    .then(() => {
      return res.status(200).send({ ok: true })
    })
    .catch((err) => {
      console.error(err)
    })
}
