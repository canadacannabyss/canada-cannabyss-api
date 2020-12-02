import { Request, Response } from 'express'
import { v4 } from 'uuid'
import _ from 'lodash'

import { slugifyString, generateRandomSlug } from '../../../utils/strings/slug'
import {
  getCategory,
  createCategory,
} from '../../../utils/categories/categories'
import { getTag, createTag } from '../../../utils/tags/tags'

import Promotion from '../../../models/promotion/Promotion'
import PromotionMedia from '../../../models/promotion/PromotionMedia'
import Product from '../../../models/product/Product'
import Bundle from '../../../models/bundle/Bundle'
import ProductMedia from '../../../models/product/ProductMedia'
import Category from '../../../models/category/Category'
import Tag from '../../../models/tag/Tag'

const verifyValidSlug = async (slug) => {
  try {
    const promotion = await Promotion.find({
      slug,
    })
    console.log('promotion:', promotion)
    if (!_.isEmpty(promotion)) {
      return false
    } else {
      return true
    }
  } catch (err) {
    console.log(err)
  }
}

export function index(req: Request, res: Response) {
  Promotion.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: PromotionMedia,
    })
    .then((promotions) => {
      console.log('promotions:', promotions)
      return res.status(200).send(promotions)
    })
    .catch((err) => {
      console.log(err)
    })
}

export function getAllPromotions(req: Request, res: Response) {
  Promotion.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: PromotionMedia,
    })
    .then((promotions) => {
      console.log('promotions:', promotions)
      return res.status(200).send(promotions)
    })
    .catch((err) => {
      console.log(err)
    })
}

export function getPromotionBySlug(req: Request, res: Response) {
  const { slug } = req.params
  Promotion.findOne({
    slug: slug,
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
    .then((promotion) => {
      console.log('promotions:', promotion)
      return res.status(200).send(promotion)
    })
    .catch((err) => {
      console.log(err)
    })
}

export function getBySlug(req: Request, res: Response) {
  const { slug } = req.params

  Promotion.findOne({
    slug: slug,
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: PromotionMedia,
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
      path: 'bundles',
      model: Bundle,
      populate: {
        path: 'products',
        model: Product,
        populate: {
          path: 'media',
          model: ProductMedia,
        },
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
    .then((bundle) => {
      console.log('bundle found:', bundle)
      const errors = []
      if (!bundle) errors.push({ error: 'Bundle not found' })

      if (errors.length > 0) {
        return res.status(400).send(errors)
      } else {
        return res.status(200).send(bundle)
      }
    })
    .catch((err) => {
      console.log(err)
      return res.status(400).send({ error: 'Server error' })
    })
}

export function panelGetBySlug(req: Request, res: Response) {
  const { slug } = req.params
  Promotion.findOne({
    slug,
  })
    .populate({
      path: 'media',
      model: PromotionMedia,
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
    .then((promotion) => {
      return res.json(promotion)
    })
    .catch((err) => {
      console.log(err)
    })
}

export function validateSlug(req: Request, res: Response) {
  const { slug } = req.params
  const verificationRes = verifyValidSlug(slug)
  return res.json({
    valid: verificationRes,
  })
}

export async function publish(req: Request, res: Response) {
  const {
    reseller,
    isSlugValid,
    promotionName,
    media,
    products,
    bundles,
    description,
    seo,
    organization,
  } = req.body

  try {
    let slug = slugifyString(promotionName)

    if (!(await verifyValidSlug(slug))) {
      slug = await generateRandomSlug(slug)
    }

    if (await verifyValidSlug(slug)) {
      const promisesCategories = organization.categories.map(
        async (category) => {
          let categoryObj = await getCategory(category)

          if (_.isEmpty(categoryObj)) {
            categoryObj = await createCategory(category, reseller)
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

      const newPromotion = new Promotion({
        reseller,
        media,
        promotionName,
        slug,
        description,
        products,
        bundles,
        seo,
        organization: {
          categories: resultsAsyncCategoriesArray,
          tags: resultsAsyncTagsArray,
        },
      })

      newPromotion
        .save()
        .then((promotion) => {
          return res.status(201).send({
            slug: promotion.slug,
          })
        })
        .catch((err) => {
          console.log(err)
        })
    } else {
      return res.json({ error: 'The provided slug is invalid' })
    }
  } catch (err) {
    console.log(err)
  }
}

export async function uploadMedia(req: Request, res: Response) {
  const { originalname: name, size, key, location: url = '' } = req.file
  const id = v4()

  const cover = await PromotionMedia.create({
    id,
    name,
    size,
    key,
    url,
  })

  console.log(cover)

  return res.json(cover)
}

export function setGlobalVariable(req: Request, res: Response) {
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
    reseller,
    promotionName,
    description,
    products,
    bundles,
    seo,
    organization,
  } = req.body
  const { id } = req.params

  let slug = slugifyString(promotionName)

  if (!(await verifyValidSlug(slug))) {
    slug = await generateRandomSlug(slug)
  }

  try {
    let newMedia = []
    const promotionObj = await Promotion.findOne({
      _id: id,
    })
    if (media === undefined) {
      newMedia = promotionObj.media
    } else {
      newMedia = media
      if (promotionObj.slug !== slug) {
        const promotionMediaObj = await PromotionMedia.findOne({
          _id: promotionObj.media,
        })
        promotionMediaObj.remove()
      }
    }

    const promisesCategories = organization.categories.map(async (category) => {
      let categoryObj = await getCategory(category)

      if (_.isEmpty(categoryObj)) {
        categoryObj = await createCategory(category, reseller)
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

    await Promotion.findOneAndUpdate(
      {
        _id: id,
      },
      {
        reseller,
        media: newMedia,
        promotionName: promotionName,
        slug: slug,
        description: description,
        products: products,
        bundles: bundles,
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

    const newUpdatedPromotion = await Promotion.findOne({
      _id: id,
    })
    return res.status(200).send({
      slug: newUpdatedPromotion.slug,
    })
  } catch (err) {
    console.log(err)
  }
}

export async function deletePromotion(req: Request, res: Response) {
  const { promotionId } = req.params

  Promotion.findOne({
    _id: promotionId,
  })
    .then(async (promotion) => {
      await PromotionMedia.findOneAndUpdate(
        {
          _id: promotion.media,
        },
        {
          'deletion.isDeleted': true,
          'deletion.when': Date.now(),
        },
        {
          runValidators: true,
        },
      )

      promotion
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
    .catch((err) => {
      console.error(err)
    })
}

export async function deleteMedia(req: Request, res: Response) {
  try {
    const { id } = req.params

    PromotionMedia.findOneAndUpdate(
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
  } catch (err) {
    console.error(err)
  }
}
