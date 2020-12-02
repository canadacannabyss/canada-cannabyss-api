import { Request, Response } from 'express'
import _ from 'lodash'

import { slugifyString, generateRandomSlug } from '../../../utils/strings/slug'
import {
  getCategory,
  createCategory,
} from '../../../utils/categories/categories'
import { getTag, createTag } from '../../../utils/tags/tags'

import Coupon from '../../../models/coupon/Coupon'
import Category from '../../../models/category/Category'
import CategoryMedia from '../../../models/category/CategoryMedia'
import Tag from '../../../models/tag/Tag'

const verifyValidSlug = async (slug) => {
  try {
    const coupon = await Coupon.find({
      slug,
    })
    console.log('product:', coupon)
    if (!_.isEmpty(coupon)) {
      return false
    } else {
      return true
    }
  } catch (err) {
    console.log(err)
  }
}

export async function index(req: Request, res: Response) {
  Coupon.find({
    'deletion.isDeleted': false,
  })
    .then((coupons) => {
      return res.status(200).send(coupons)
    })
    .catch((err) => {
      console.error(err)
    })
}

export async function validateCouponName(req: Request, res: Response) {
  const { couponName } = req.params

  Coupon.findOne({
    couponName,
  })
    .then((coupon) => {
      console.log('coupon:', coupon)
      if (!coupon) {
        return res.json(true)
      } else {
        return res.json(false)
      }
    })
    .catch((err) => {
      console.error(err)
    })
}

export async function getBySlug(req: Request, res: Response) {
  const { slug } = req.params
  console.log('slug:', slug)

  Coupon.findOne({
    slug,
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'organization.categories',
      model: Category,
    })
    .populate({
      path: 'organization.tags',
      model: Tag,
    })
    .then((coupon) => {
      console.log('coupon:', coupon)
      return res.status(200).send(coupon)
    })
    .catch((err) => {
      console.error(err)
    })
}

export async function create(req: Request, res: Response) {
  const {
    resellerId,
    couponName,
    description,
    featured,
    freeShipping,
    availableAt,
    quantity,
    discount,
    seo,
    organization,
    products,
    bundles,
  } = req.body

  console.log('req.body:', req.body)

  try {
    let slug = slugifyString(couponName)
    if (!(await verifyValidSlug(slug))) {
      slug = await generateRandomSlug(slug)
    }

    if (await verifyValidSlug(slug)) {
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

      const newCoupon = new Coupon({
        reseller: resellerId,
        couponName,
        slug,
        description,
        availableAt,
        featured,
        freeShipping,
        quantity,
        products,
        bundles,
        seo,
        organization: {
          categories: resultsAsyncCategoriesArray,
          tags: resultsAsyncTagsArray,
        },
        discount: {
          type: discount.type,
          amount: discount.amount,
        },
      })

      newCoupon
        .save()
        .then(() => {
          return res.status(200).send({ ok: true })
        })
        .catch((err) => {
          console.error(err)
        })
    }
  } catch (err) {
    console.error(err)
  }
}

export async function edit(req: Request, res: Response) {
  const {
    id,
    resellerId,
    couponName,
    description,
    featured,
    freeShipping,
    availableAt,
    quantity,
    discount,
    seo,
    organization,
    products,
    bundles,
  } = req.body

  try {
    let slug = slugifyString(couponName)

    if (!(await verifyValidSlug(slug))) {
      slug = await generateRandomSlug(slug)
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

    Coupon.findOneAndUpdate(
      {
        _id: id,
      },
      {
        reseller: resellerId,
        couponName,
        slug,
        description,
        availableAt,
        featured,
        freeShipping,
        quantity,
        products,
        bundles,
        seo,
        organization: {
          categories: resultsAsyncCategoriesArray,
          tags: resultsAsyncTagsArray,
        },
        discount: {
          type: discount.type,
          amount: discount.amount,
        },
        updatedOn: Date.now(),
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

export async function deleteCoupon(req: Request, res: Response) {
  const { couponId } = req.params

  Coupon.findOneAndUpdate(
    {
      _id: couponId,
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
