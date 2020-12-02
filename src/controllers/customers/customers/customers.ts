import { Request, Response } from 'express'
import { v4 } from 'uuid'

import Product from '../../../models/product/Product'
import ProductComment from '../../../models/product/ProductComment'
import ProductCommentReply from '../../../models/product/ProductCommentReply'
import ProductMedia from '../../../models/product/ProductMedia'

import Bundle from '../../../models/bundle/Bundle'
import BundleComment from '../../../models/bundle/BundleComment'
import BundleCommentReply from '../../../models/bundle/BundleCommentReply'

import Customer from '../../../models/customer/Customer'
import CustomerProfileImage from '../../../models/customer/CustomerProfileImage'

export async function postCommentProduct(req: Request, res: Response) {
  const { productId, userId, content, stars } = req.body

  console.log('productId:', productId)
  console.log('userId:', userId)
  console.log('content:', content)

  const errors = []
  if (!productId || !userId || !content) {
    errors.push({
      errorMsg: 'Please enter all fields.',
    })
  }

  if (errors.length > 0) {
    return res.json({
      error: errors,
    })
  } else {
    const id = v4()
    const createdAt = Date.now()
    const updatedOn = null
    let commentObj
    let commentId
    const newComment = new ProductComment({
      id,
      customer: userId,
      product: productId,
      content,
      createdAt,
      updatedOn,
      stars: stars,
      likes: 0,
      dislikes: 0,
      replies: [],
    })
    await newComment
      .save()
      .then((comment) => {
        commentObj = comment
        commentId = comment._id
      })
      .catch((err) => {
        console.log('err:', err)
        return res.json({
          err,
        })
      })

    try {
      const commentsArray = await ProductComment.find({
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
        .populate({
          path: 'product',
          model: Product,
        })
        .sort({
          createdAt: '-1',
        })

      console.log('commentsArray:', commentsArray)

      return res.json(commentsArray)
    } catch (err) {
      console.log('err:', err)
      return res.json({
        err,
      })
    }
  }
}

export async function postCommentBundle(req: Request, res: Response) {
  const { bundleId, userId, content, stars } = req.body

  console.log('bundleId:', bundleId)
  console.log('userId:', userId)
  console.log('content:', content)

  const errors = []
  if (!bundleId || !userId || !content) {
    errors.push({
      errorMsg: 'Please enter all fields.',
    })
  }

  if (errors.length > 0) {
    return res.json({
      error: errors,
    })
  } else {
    const id = v4()
    const createdAt = Date.now()
    const updatedOn = null
    let commentObj
    let commentId
    const newComment = new BundleComment({
      id,
      customer: userId,
      bundle: bundleId,
      content,
      createdAt,
      updatedOn,
      stars: stars,
      likes: 0,
      dislikes: 0,
      replies: [],
    })
    await newComment
      .save()
      .then((comment) => {
        commentObj = comment
        commentId = comment._id
      })
      .catch((err) => {
        console.log('err:', err)
        return res.json({
          err,
        })
      })

    try {
      const commentsArray = await BundleComment.find({
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
        .populate({
          path: 'bundle',
          model: Bundle,
        })
        .sort({
          createdAt: '-1',
        })

      console.log('commentsArray:', commentsArray)

      return res.json(commentsArray)
    } catch (err) {
      console.log('err:', err)
      return res.json({
        err,
      })
    }
  }
}

export async function replyComment(req: Request, res: Response) {
  const { productId, commentId, userId, content } = req.body

  console.log('commentId:', commentId)

  const errors = []
  if (!productId || !userId || !content || !commentId) {
    errors.push({
      errorMsg: 'Please enter all fields.',
    })
  }

  if (errors.length > 0) {
    return res.json({
      error: errors,
    })
  } else {
    const id = v4()
    const createdAt = Date.now()
    const updatedOn = null
    let commentIdVar
    const newCommentReply = new CommentReply({
      id,
      customer: userId,
      product: productId,
      comment: commentId,
      content,
      createdAt,
      updatedOn,
      likes: 0,
      dislikes: 0,
    })
    await newCommentReply
      .save()
      .then((comment) => {
        commentIdVar = comment._id
      })
      .catch((err) => {
        console.log('err:', err)
        return res.json({
          err,
        })
      })

    try {
      const PostObj = await Product.findOne({
        _id: postId,
      })
      const CommentObj = await Comment.findOne({
        _id: commentId,
      })
      let commentObjReplies = await CommentObj.replies
      console.log('commentObjReplies:', commentObjReplies)
      commentObjReplies.push(commentIdVar)
      console.log('commentObjReplies:', commentObjReplies)
      await Comment.updateOne(
        {
          _id: postId,
        },
        {
          replies: commentObjReplies,
        },
        {
          runValidation: true,
        },
      )
      return res.status(200).send({ ok: true })
    } catch (err) {
      console.log('err:', err)
      return res.json({
        err,
      })
    }
  }
}

export async function verifyExistPost(req: Request, res: Response) {
  const { productId } = req.params

  const errors = []
  if (!productId) {
    errors.push({
      errorMsg: 'Please enter all fields.',
    })
  }

  Product.findOne({
    _id: productId,
  })
    .then((post) => {
      return res.status(200).json(post)
    })
    .catch((err) => {
      return res.json({
        err,
      })
    })
}

export async function verufyExistComment(req: Request, res: Response) {
  const { commentId } = req.params

  const errors = []
  if (!commentId) {
    errors.push({
      errorMsg: 'Please enter all fields.',
    })
  }

  ProductComment.findOne({
    _id: commentId,
  })
    .then((post) => {
      return res.status(200).json(post)
    })
    .catch((err) => {
      return res.json({
        err,
      })
    })
}
