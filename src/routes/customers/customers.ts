import { Router } from 'express'
import {
  postCommentBundle,
  postCommentProduct,
  replyComment,
  verifyExistPost,
  verufyExistComment,
} from '../../controllers/customers/customers/customers'

const router = Router()

router.post('/comment/post', postCommentProduct)

router.post('/bundle/comment/post', postCommentBundle)

router.post('/comment/reply', replyComment)

router.get('/verify/exist/post/:postId', verifyExistPost)

router.get('/verify/exist/comment/:commentId', verufyExistComment)

export default router
