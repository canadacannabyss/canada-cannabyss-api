import { Request, Response } from 'express'
import _ from 'lodash'

import { slugifyString, generateRandomSlug } from '../../../utils/strings/slug'

import PostalService from '../../../models/postalService/postalService'

const verifyValidSlug = async (slug) => {
  try {
    const product = await PostalService.find({
      slug,
      'deletion.isDeleted': false,
    })
    console.log('product:', product)
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
  PostalService.find({
    'deletion.isDeleted': false,
  })
    .then((postalServices) => {
      return res.status(200).send(postalServices)
    })
    .catch((err) => {
      console.error(err)
    })
}

export function validatePostalServiceName(req: Request, res: Response) {
  const { postalServiceName } = req.params

  let valid = false
  PostalService.findOne({
    name: postalServiceName,
    'deletion.isDeleted': false,
  }).then((postalService) => {
    if (!postalService) {
      valid = true
    }

    return res.status(200).send({
      ok: valid,
    })
  })
}

export function getBySlug(req: Request, res: Response) {
  const { slug } = req.params

  PostalService.findOne({
    slug,
  })
    .then((postalService) => {
      if (!postalService) return res.status(200).send({})
      return res.status(200).send(postalService)
    })
    .catch((err) => {
      console.log(err)
      return res.status(200).send({})
    })
}

export async function create(req: Request, res: Response) {
  const { admin, postalServiceName, trackingWebsite } = req.body

  let slug = slugifyString(postalServiceName)

  if (!(await verifyValidSlug(slug))) {
    slug = await generateRandomSlug(slug)
  }

  const newPostalService = new PostalService({
    admin,
    name: postalServiceName,
    trackingWebsite,
    slug,
  })

  newPostalService
    .save()
    .then(() => {
      return res.status(200).send({ ok: true })
    })
    .catch((err) => {
      console.error(err)
      return res.status(500).send({ ok: false })
    })
}

export async function edit(req: Request, res: Response) {
  const { id, postalServiceName } = req.body

  try {
    let slug = slugifyString(postalServiceName)

    if (!(await verifyValidSlug(slug))) {
      slug = await generateRandomSlug(slug)
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

export async function deletePostalService(req: Request, res: Response) {
  const { postalServiceId } = req.params

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
    },
  )
    .then(() => {
      return res.status(200).send({ ok: true })
    })
    .catch((err) => {
      console.error(err)
    })
}
