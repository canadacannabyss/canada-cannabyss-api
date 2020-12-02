import { Request, Response } from 'express'
import { v4 } from 'uuid/v4'
import slugify from 'slugify'
import _ from 'lodash'

import Promotion from '../models/promotion/Promotion'
import PromotionMedia from '../models/promotion/PromotionMedia'
import Product from '../models/product/Product'
import ProductMedia from '../models/product/ProductMedia'

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

export async function index(req: Request, res: Response) {
  Promotion.find()
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

export async function getBySlug(req: Request, res: Response) {
  const { slug } = req.params
  Promotion.findOne({
    slug: slug,
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
      path: 'media',
      model: PromotionMedia,
    })
    .then((promotion) => {
      console.log('promotions:', promotion)
      return res.status(200).send(promotion)
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
    products,
    isSlugValid,
    promotionName,
    media,
    bundles,
    description,
    seo,
    organization,
  } = req.body

  let errors = []
  if (
    (_.isEmpty(products) && _.isEmpty(bundles)) ||
    !media ||
    !typeof isSlugValid === 'boolean' ||
    !promotionName ||
    !description ||
    !seo.title ||
    !seo.slug ||
    !seo.description ||
    !organization.category ||
    !organization.tags
  ) {
    if (!typeof isSlugValid === 'boolean') {
      errors.push({
        value: isSlugValid,
        errMsg: 'isSluValid should be boolean',
      })
    } else if (!promotionName) {
      errors.push({
        value: promotionName,
        errMsg: 'promotionName must have at least 1 character',
      })
    } else if (!description) {
      errors.push({
        value: description,
        errMsg: 'description must have at least 1 character',
      })
    } else if (!seo.title) {
      errors.push({
        value: seo.title,
        errMsg: 'seo.title must have at least 1 character',
      })
    } else if (!seo.slug) {
      errors.push({
        value: seo.slug,
        errMsg: 'seo.slug must have at least 1 character',
      })
    } else if (!seo.description) {
      errors.push({
        value: seo.description,
        errMsg: 'seo.description must have at least 1 character',
      })
    } else if (!organization.category) {
      errors.push({
        value: organization.category,
        errMsg: 'organization.category must have at least 1 character',
      })
    } else if (!organization.tags) {
      errors.push({
        value: organization.tags,
        errMsg: 'organization.tags must have at least 1 character',
      })
    } else if (_.isEmpty(products)) {
      errors.push({
        value: products,
        errMsg: 'products must have at least 1 product selected',
      })
    }
  }

  if (errors.length > 0) {
    res.json({
      errors,
    })
  } else {
    const slug = slugify(promotionName).toLowerCase()
    if (await verifyValidSlug(slug)) {
      console.log('media:', media)
      const newPromotion = new Promotion({
        products,
        media,
        bundles,
        promotionName,
        slug,
        description,
        seo,
        organization,
      })

      console.log('newPromotion:', newPromotion)

      newPromotion
        .save()
        .then((promotion) => {
          return res.status(201).send({
            _id: promotion._id,
          })
        })
        .catch((err) => {
          console.log(err)
        })
    } else {
      return res.json({ error: 'The provided slug is invalid' })
    }
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

export async function setGlobalVariable(req: Request, res: Response) {
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
  const { slug, category, title, content, tags } = req.body
  const { id } = req.params
  console.log('SLUG:', slug)
  Product.updateOne(
    {
      id,
    },
    {
      slug,
      category,
      title,
      content,
      tags,
      updatedOn: Date.now(),
    },
    {
      runValidators: true,
    },
  )
    .then((post) => {
      console.log('res:', {
        msg: 'Product details has been successfully updated.',
        id,
        slug,
        category,
        title,
        content,
        tags,
        updated: true,
        updatedOn: post.updatedOn,
      })
      return res.json({
        msg: 'Product details has been successfully updated.',
        id,
        category,
        title,
        content,
        tags,
        updated: true,
        updatedOn: post.updatedOnOn,
      })
    })
    .catch((err) => {
      return res.json({
        errorMsg: err,
      })
    })
}

export async function oldDelete(req: Request, res: Response) {
  const { id } = req.params
  Product.deleteOne({
    id,
  })
    .then(() => {
      return res.json({
        msg: ' Blog Product deleted successfully!',
      })
    })
    .catch((err) => {
      return res.json({
        errorMgs: err,
      })
    })
}

export async function oldDeleteMedia(req: Request, res: Response) {
  const { id } = req.params
  const coverFile = await PromotionMedia.findOne({
    _id: id,
  })
  console.log('id:', id)
  console.log('coverFile:', coverFile)
  await coverFile.remove()
  return res.send({
    msg: 'Blog Product cover file successfully deleted',
  })
}
