import { Request, Response } from 'express'
import { v4 } from 'uuid'
import _ from 'lodash'

import { slugifyString, generateRandomSlug } from '../../../utils/strings/slug'
import {
  getCategory,
  createCategory,
} from '../../../utils/categories/categories'
import { getTag, createTag } from '../../../utils/tags/tags'

import Bundle from '../../../models/bundle/Bundle'
import Category from '../../../models/category/Category'
import CategoryMedia from '../../../models/category/CategoryMedia'
import Product from '../../../models/product/Product'
import ProductMedia from '../../../models/product/ProductMedia'
import Tag from '../../../models/tag/Tag'

const verifyValidSlug = async (slug) => {
  try {
    const bundle = await Bundle.find({
      slug,
    })
    console.log('bundle:', bundle)
    if (!_.isEmpty(bundle)) {
      return false
    } else {
      return true
    }
  } catch (err) {
    console.log(err)
  }
}

export async function index(req: Request, res: Response) {
  try {
    const allBundles = await Bundle.find({
      'deletion.isDeleted': false,
    }).populate({
      path: 'products',
      model: Product,
      populate: {
        path: 'media',
        model: ProductMedia,
      },
    })

    return res.status(200).send(allBundles)
  } catch (err) {
    console.error(err)
  }
}

export async function panelGetBundleBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params

    const bundle = await Bundle.findOne({
      slug,
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

    res.status(200).send(bundle)
  } catch (err) {
    console.error(err)
  }
}

export async function getBundleBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params

    const bundle = await Bundle.findOne({
      slug,
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

    const errors = []

    if (!bundle) errors.push({ error: 'Bundle not found' })

    if (errors.length > 0) {
      return res.status(400).send(errors)
    } else {
      return res.status(200).send(bundle)
    }
  } catch (err) {
    console.error(err)
    return res.status(500).send({ error: 'Server error' })
  }
}

export function validateSlug(req: Request, res: Response) {
  try {
    const { slug } = req.params

    const verificationRes = verifyValidSlug(slug)
    res.status(200).send({
      valid: verificationRes,
    })
  } catch (err) {
    console.error(err)
  }
}

export async function publish(req: Request, res: Response) {
  try {
    const {
      reseller,
      products,
      isSlugValid,
      variants,
      bundleName,
      prices,
      taxableBundle,
      description,
      extraInfo,
      inventory,
      shipping,
      seo,
      organization,
    } = req.body

    let slug = slugifyString(bundleName)

    if (!(await verifyValidSlug(slug))) {
      slug = await generateRandomSlug(slug)
    }

    if (await verifyValidSlug(slug)) {
      try {
        const promisesCategories = organization.categories.map(
          async (category) => {
            let categoryObj = await getCategory(category)

            if (_.isEmpty(categoryObj)) {
              categoryObj = await createCategory(category, reseller)
            }
            return categoryObj
          },
        )

        const resultsAsyncCategoriesArray = await Promise.all(
          promisesCategories,
        )

        const promisesTags = organization.tags.map(async (tag) => {
          let tagObj = await getTag(tag)

          if (_.isEmpty(tagObj)) {
            tagObj = await createTag(tag)
          }
          return tagObj
        })

        const resultsAsyncTagsArray = await Promise.all(promisesTags)

        const newBundle = new Bundle({
          reseller,
          products: products,
          variants,
          bundleName,
          slug,
          prices,
          taxableBundle,
          description,
          extraInfo,
          inventory,
          shipping,
          seo,
          organization: {
            categories: resultsAsyncCategoriesArray,
            tags: resultsAsyncTagsArray,
          },
        })

        console.log('newBundle:', newBundle)

        newBundle
          .save()
          .then((bundle) => {
            console.log('bundle saved:', bundle)
            return res.status(201).send({
              slug: bundle.slug,
            })
          })
          .catch((err) => {
            console.log(err)
          })
      } catch (err) {
        console.log(err)
      }
    } else {
      return res.status(200).send({ error: 'The provided slug is invalid' })
    }
  } catch (err) {
    console.error(err)
  }
}

export async function uploadMedia(req: Request, res: Response) {
  try {
    const { originalname: name, size, key, location: url = '' } = req.file
    const id = v4()
    console.log('id:', id)

    const cover = await ProductMedia.create({
      id,
      name,
      size,
      key,
      url,
    })

    return res.status(200).send(cover)
  } catch (err) {
    console.error(err)
  }
}

export function setGlobalVariable(req: Request, res: Response) {
  try {
    const { type, title } = req.body

    global.gConfigMulter.type = type
    global.gConfigMulter.title = title
    global.gConfigMulter.folder_name = global.gConfigMulter.title
    global.gConfigMulter.destination = `${global.gConfigMulter.type}/${global.gConfigMulter.folder_name}`

    return res.status(200).send({
      ok: true,
    })
  } catch (err) {
    console.error(err)
  }
}

export async function updateBundle(req: Request, res: Response) {
  try {
    const {
      reseller,
      products,
      variants,
      bundleName,
      prices,
      taxableBundle,
      description,
      extraInfo,
      inventory,
      shipping,
      seo,
      organization,
    } = req.body
    const { id } = req.params

    let slug = slugifyString(bundleName)

    if (!(await verifyValidSlug(slug))) {
      slug = await generateRandomSlug(slug)
    }

    if (await verifyValidSlug(slug)) {
      try {
        const promisesCategories = organization.categories.map(
          async (category) => {
            let categoryObj = await getCategory(category)

            if (_.isEmpty(categoryObj)) {
              categoryObj = await createCategory(category, reseller)
            }
            return categoryObj
          },
        )

        const resultsAsyncCategoriesArray = await Promise.all(
          promisesCategories,
        )

        const promisesTags = organization.tags.map(async (tag) => {
          let tagObj = await getTag(tag)

          if (_.isEmpty(tagObj)) {
            tagObj = await createTag(tag)
          }
          return tagObj
        })

        const resultsAsyncTagsArray = await Promise.all(promisesTags)

        await Bundle.findOneAndUpdate(
          {
            _id: id,
          },
          {
            reseller,
            products: products,
            variants: variants,
            bundleName: bundleName,
            slug: slug,
            prices: {
              price: prices.price,
              compareTo: prices.compareTo,
            },
            taxableBundle: taxableBundle,
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

        const newUpdatedBundle = await Bundle.findOne({
          _id: id,
        })
        return res.status(200).send({
          slug: newUpdatedBundle.slug,
        })
      } catch (err) {
        console.log(err)
      }
    } else {
      return res.json({ error: 'The provided slug is invalid' })
    }
  } catch (err) {
    console.error(err)
  }
}

export async function deleteBundle(req: Request, res: Response) {
  try {
    const { bundleId } = req.params

    await Bundle.findOneAndUpdate(
      {
        _id: bundleId,
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
  } catch (err) {
    console.error(err)
  }
}
