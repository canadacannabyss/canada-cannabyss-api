const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {
  slugifyString,
  generateRandomSlug,
} = require('../../../utils/strings/slug');

const Coupon = require('../../../models/coupon/Coupon');

const verifyValidSlug = async (slug) => {
  try {
    const coupon = await Coupon.find({
      slug,
    });
    console.log('product:', coupon);
    if (!_.isEmpty(coupon)) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
};

router.get('/get/all', async (req, res) => {
  Coupon.find()
    .then((coupons) => {
      res.status(200).send(coupons);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get('/validate/couponName/:couponName', async (req, res) => {
  const { couponName } = req.params;

  Coupon.findOne({
    couponName,
  })
    .then((coupon) => {
      console.log('coupon:', coupon);
      if (!coupon) {
        res.json(true);
      } else {
        res.json(false);
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get('/get/coupon/:slug', async (req, res) => {
  const { slug } = req.params;
  Coupon.findOne({
    slug,
  })
    .then((coupon) => {
      res.status(200).send(coupon);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.post('/create', async (req, res) => {
  const {
    couponName,
    description,
    featured,
    freeShipping,
    availableAt,
    quantity,
    discount,
    itemsOnCoupon,
  } = req.body;

  try {
    let slug = slugifyString(couponName);
    if (!(await verifyValidSlug(slug))) {
      slug = await generateRandomSlug(slug);
    }

    const newItems = [];

    itemsOnCoupon.map((item) => {
      newItems.push({
        _id: item,
      });
    });

    const newCoupon = new Coupon({
      couponName,
      slug,
      description,
      availableAt,
      featured,
      freeShipping,
      quantity,
      items: newItems,
      discount: {
        type: discount.type,
        amount: discount.amount,
      },
    });

    newCoupon
      .save()
      .then(() => {
        res.status(200).send({ ok: true });
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (err) {
    console.error(err);
  }
});

router.put('/edit', async (req, res) => {
  const {
    id,
    couponName,
    description,
    featured,
    freeShipping,
    quantity,
    availableAt,
    discount,
  } = req.body;

  try {
    let slug = slugifyString(couponName);
    if (!(await verifyValidSlug(slug))) {
      slug = await generateRandomSlug(slug);
    }

    Coupon.findOneAndUpdate(
      {
        _id: id,
      },
      {
        couponName,
        slug,
        description,
        availableAt,
        featured,
        freeShipping,
        quantity,
        discount: {
          type: discount.type,
          amount: discount.amount,
        },
      },
      {
        runValidators: true,
      }
    )
      .then(() => {
        res.status(200).send({ ok: true });
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (err) {
    console.error(err);
  }
});

// Delete Podcast
router.delete('/delete/coupon/:couponId', async (req, res) => {
  const { couponId } = req.params;
  console.log('couponId:', couponId);

  try {
    const productObj = await Coupon.findOne({
      _id: couponId,
    });
    productObj.remove();
    const allCoupons = await Coupon.find();
    console.log(allCoupons);
    res.status(200).send(allCoupons);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
