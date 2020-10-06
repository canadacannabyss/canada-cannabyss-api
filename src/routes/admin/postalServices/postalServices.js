const express = require('express');
const _ = require('lodash');

const router = express.Router();

const {
  slugifyString,
  generateRandomSlug,
} = require('../../../utils/strings/slug');

const PostalService = require('../../../models/postalService/postalService');

const verifyValidSlug = async (slug) => {
  try {
    const product = await PostalService.find({
      slug,
      'deletion.isDeleted': false,
    });
    console.log('product:', product);
    if (!_.isEmpty(product)) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
};

router.get('', (req, res) => {
  PostalService.find({
    'deletion.isDeleted': false,
  })
    .then((postalServices) => {
      res.status(200).send(postalServices);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get('/validate/postal-service/:postalServiceName', (req, res) => {
  const { postalServiceName } = req.params;

  let valid = false;
  PostalService.findOne({
    name: postalServiceName,
    'deletion.isDeleted': false,
  }).then((postalService) => {
    if (!postalService) {
      valid = true;
    }

    res.status(200).send({
      ok: valid,
    });
  });
});

router.get('/:slug', (req, res) => {
  const { slug } = req.params;

  PostalService.findOne({
    slug,
  })
    .then((postalService) => {
      if (!postalService) res.status(200).send({});
      res.status(200).send(postalService);
    })
    .catch((err) => {
      console.log(err);
      res.status(200).send({});
    });
});

router.post('/create', async (req, res) => {
  const { admin, postalServiceName, trackingWebsite } = req.body;

  let slug = slugifyString(postalServiceName);

  if (!(await verifyValidSlug(slug))) {
    slug = await generateRandomSlug(slug);
  }

  const newPostalService = new PostalService({
    admin,
    name: postalServiceName,
    trackingWebsite,
    slug,
  });

  newPostalService
    .save()
    .then(() => {
      res.status(200).send({ ok: true });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ ok: false });
    });
});

router.put('/edit', async (req, res) => {
  const { id, postalServiceName } = req.body;

  try {
    let slug = slugifyString(postalServiceName);

    if (!(await verifyValidSlug(slug))) {
      slug = await generateRandomSlug(slug);
    }

    PostalService.findOneAndUpdate(
      {
        _id: id,
      },
      {
        name: postalServiceName,
        slug,
        updatedOn: Date.now(),
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

router.put('/delete/postal-service/:postalServiceId', async (req, res) => {
  const { postalServiceId } = req.params;

  PostalService.findOneAndUpdate(
    {
      _id: postalServiceId,
    },
    {
      'deletion.isDeleted': true,
      'deletion.when': Date.now(),
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
});

module.exports = router;
