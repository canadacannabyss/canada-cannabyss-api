import { Request, Response } from 'express'

import Product from '../../../models/product/Product'
import ProductComment from '../../../models/product/ProductComment'
import Bundle from '../../../models/bundle/Bundle'
import BundleComment from '../../../models/bundle/BundleComment'
import Customer from '../../../models/customer/Customer'
import CustomerProfileImage from '../../../models/customer/CustomerProfileImage'

export async function getAllReviewsByUser(req: Request, res: Response) {
  const { userId } = req.params

  const commentsList = []
  const commentsProductList = []
  const commentsBundleList = []

  try {
    const commentsProductObj = await ProductComment.find({
      customer: userId,
    })
      .populate({
        path: 'customer',
        model: Customer,
        populate: {
          path: 'profileImage',
          model: CustomerProfileImage,
        },
      })
      .populate({
        path: 'product',
        model: Product,
      })

    commentsProductObj.map((comment) => {
      commentsProductList.push({
        _id: comment._id,
        customer: {
          names: {
            firstName: comment.customer.names.firstName,
            lastName: comment.customer.names.lastName,
          },
          profileImage: {
            url: comment.customer.profileImage.url,
          },
        },
        product: {
          productName: comment.product.productName,
          slug: comment.product.slug,
        },
        createdAt: comment.createdAt,
        content: comment.content,
      })
    })

    const commentsBundleObj = await BundleComment.find({
      customer: userId,
    })
      .populate({
        path: 'customer',
        model: Customer,
        populate: {
          path: 'profileImage',
          model: CustomerProfileImage,
        },
      })
      .populate({
        path: 'bundle',
        model: Bundle,
      })

    commentsBundleObj.map((comment) => {
      commentsBundleList.push({
        _id: comment._id,
        customer: {
          names: {
            firstName: comment.customer.names.firstName,
            lastName: comment.customer.names.lastName,
          },
          profileImage: {
            url: comment.customer.profileImage.url,
          },
        },
        bundle: {
          bundleName: comment.bundle.bundleName,
          slug: comment.bundle.slug,
        },
        createdAt: comment.createdAt,
        content: comment.content,
      })
    })

    const resultObj = {
      commentsProduct: commentsProductList,
      commentsBundle: commentsBundleList,
    }

    return res.status(200).send(resultObj)
  } catch (err) {
    console.error(err)
  }
}
