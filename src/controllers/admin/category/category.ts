import { Request, Response } from 'express'
import { v4 } from 'uuid/v4'
import slugify from 'slugify'
import _ from 'lodash'

import { slugifyString, generateRandomSlug } from '../../../utils/strings/slug'

import Category from '../../../models/category/Category'
import CategoryMedia from '../../../models/category/CategoryMedia'
import Product from '../../../models/product/Product'
import Bundle from '../../../models/bundle/Bundle'
import Promotion from '../../../models/promotion/Promotion'
import Banner from '../../../models/banner/Banner'

const verifyValidSlug = async (slug) => {
  try {
    const product = await Category.find({
      slug,
    })
    if (!_.isEmpty(product)) {
      return false
    } else {
      return true
    }
  } catch (err) {
    console.log(err)
  }
}

export function index(req: Request, res: Response) {
  Category.find()
    .sort({
      createdAt: -1,
    })
    .then((categories) => {
      return res.json(categories)
    })
    .catch((err) => {
      console.log(err)
    })
}

export function panelGetBySlug(req: Request, res: Response) {
  const { slug } = req.params
  Category.findOne({
    slug,
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: CategoryMedia,
    })
    .then((category) => {
      return res.json(category)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function sync(req: Request, res: Response) {
  try {
    const categoriesObj = await Category.find()
    categoriesObj.map(async (category) => {
      const productObj = await Product.find({
        organization: {
          category: category._id,
        },
      })
      const bundleObj = await Bundle.find({
        organization: {
          category: category._id,
        },
      })
      const promotionObj = await Promotion.find({
        organization: {
          category: category._id,
        },
      })
      const bannerObj = await Banner.find({
        organization: {
          category: category._id,
        },
      })
      console.log('productObj:', productObj)
      console.log('bundleObj:', bundleObj)
      console.log('promotionObj:', promotionObj)
      console.log('bannerObj:', bannerObj)
      if (
        productObj.length === 0 &&
        bundleObj.length === 0 &&
        promotionObj.length === 0 &&
        bannerObj.length === 0
      ) {
        category.remove()
      }
    })
    const newCategories = await Category.find().populate({
      path: 'media',
      model: CategoryMedia,
    })
    console.log('newCategories:', newCategories)
    return res.status(200).send(newCategories)
  } catch (err) {
    console.log(err)
  }
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
    media,
    reseller,
    isSlugValid,
    categoryName,
    featured,
    description,
    seo,
  } = req.body

  let errors = []
  if (
    _.isEmpty(media) ||
    !typeof isSlugValid === 'boolean' ||
    !categoryName ||
    !typeof featured === 'boolean' ||
    !description ||
    !seo.title ||
    !seo.slug ||
    !seo.description
  ) {
    if (!typeof isSlugValid === 'boolean') {
      errors.push({
        value: isSlugValid,
        errMsg: 'isSluValid should be boolean',
      })
    } else if (!categoryName) {
      errors.push({
        value: categoryName,
        errMsg: 'categoryName must have at least 1 character',
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
    }
  }

  if (errors.length > 0) {
    return res.json({
      errors,
    })
  } else {
    const slug = slugify(categoryName).toLowerCase()

    if (await verifyValidSlug(slug)) {
      const newCategory = new Category({
        media,
        reseller,
        categoryName,
        featured,
        slug,
        description,
        seo,
      })

      newCategory
        .save()
        .then((category) => {
          return res.status(201).send({
            _id: category._id,
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

export async function update(req: Request, res: Response) {
  const { media, reseller, categoryName, featured, description, seo } = req.body
  const { id } = req.params

  console.log(media, categoryName, featured, description, seo)

  const slug = slugifyString(categoryName)

  try {
    let newMedia = []

    const categoryObj = await Category.findOne({
      _id: id,
    })
    if (media === undefined) {
      newMedia = categoryObj.media
    } else {
      newMedia = media
      if (categoryObj.slug !== slug) {
        console.log('categoryObj.media:', categoryObj.media)
        if (categoryObj.media) {
          const categoryMediaObj = await CategoryMedia.findOne({
            _id: categoryObj.media,
          })
          categoryMediaObj.remove()
        }
      }
    }

    await Category.findOneAndUpdate(
      {
        _id: id,
      },
      {
        media: newMedia,
        reseller,
        categoryName: categoryName,
        slug: slug,
        featured: featured,
        description: description,
        seo: {
          title: seo.title,
          slug: seo.slug,
          description: seo.description,
        },
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      },
    )

    const newUpdatedCategory = await Category.findOne({
      _id: id,
    })
    return res.status(200).send({
      slug: newUpdatedCategory.slug,
    })
  } catch (err) {
    console.log(err)
  }
}

export async function uploadMedia(req: Request, res: Response) {
  const { originalname: name, size, key, location: url = '' } = req.file
  const id = v4()
  console.log('id:', id)

  const cover = await CategoryMedia.create({
    id,
    name,
    size,
    key,
    url,
  })

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

export async function getMedia(req: Request, res: Response) {
  const { id } = req.params
  CategoryMedia.findOne({
    _id: id,
  })
    .then((cover) => {
      return res.json(cover)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function updateMedia(req: Request, res: Response) {
  const { id } = req.params
  const coverFile = await CategoryMedia.findOne({
    _id: id,
  })
  console.log('id:', id)
  console.log('coverFile:', coverFile)
  await coverFile.remove()
  return res.send({
    msg: 'Blog Category cover file successfully deleted',
  })
}

export async function deleteCategory(req: Request, res: Response) {
  const { categoryId } = req.params

  Category.findOne({
    _id: categoryId,
  }).then(async (category) => {
    await CategoryMedia.findOneAndUpdate(
      {
        _id: category.media,
      },
      {
        'deletion.isDeleted': true,
        'deletion.when': Date.now(),
      },
      {
        runValidators: true,
      },
    )

    category
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

  CategoryMedia.findOneAndUpdate(
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
