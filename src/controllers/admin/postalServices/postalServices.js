const _ = require('lodash');

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


module.exports = {
  index: (req, res) => {
    PostalService.find({
      'deletion.isDeleted': false,
    })
      .then((postalServices) => {
        return res.status(200).send(postalServices);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  validatePostalServiceName: (req, res) => {
    const { postalServiceName } = req.params;

    let valid = false;
    PostalService.findOne({
      name: postalServiceName,
      'deletion.isDeleted': false,
    }).then((postalService) => {
      if (!postalService) {
        valid = true;
      }

      return res.status(200).send({
        ok: valid,
      });
    });
  },

  getBySlug: (req, res) => {
    const { slug } = req.params;

    PostalService.findOne({
      slug,
    })
      .then((postalService) => {
        if (!postalService) return res.status(200).send({});
        return res.status(200).send(postalService);
      })
      .catch((err) => {
        console.log(err);
        return res.status(200).send({});
      });
  },

  create: async (req, res) => {
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
        return res.status(200).send({ ok: true });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).send({ ok: false });
      });
  },

  edit: async (req, res) => {
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
          return res.status(200).send({ ok: true });
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (err) {
      console.error(err);
    }
  },

  delete: async (req, res) => {
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
        return res.status(200).send({ ok: true });
      })
      .catch((err) => {
        console.error(err);
      });
  }
}