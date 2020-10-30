const express = require('express');
const router = express.Router();

const CustomerReviewsCnotroller = require('../../../controllers/customers/reviews/reviews')

router.get('/user/:userId', CustomerReviewsCnotroller.getAllReviewsByUser);

module.exports = router;
