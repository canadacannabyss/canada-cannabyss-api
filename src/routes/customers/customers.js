const express = require('express');
const router = express.Router();

const CustomerCustomerController = require('../../controllers/customers/customers/customers')

router.post('/comment/post', CustomerCustomerController.postCommentProduct);

router.post('/bundle/comment/post', CustomerCustomerController.postCommentBundle);

router.post('/comment/reply', CustomerCustomerController.replyComment);

router.get('/verify/exist/post/:postId', CustomerCustomerController.verifyExistPost);

router.get('/verify/exist/comment/:commentId', CustomerCustomerController.verufyExistComment);

module.exports = router;
