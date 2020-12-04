import { Request, Response } from 'express'

import Shipping from '../../../models/shipping/Shipping'

export async function create(req: Request, res: Response) {
  const {
    user,
    name,
    country,
    provinceState,
    city,
    addressLine1,
    addressLine2,
    postalCode,
  } = req.body

  const newShipping = new Shipping({
    customer: user,
    name,
    country,
    provinceState,
    city,
    addressLine1,
    addressLine2,
    postalCode,
  })

  newShipping
    .save()
    .then((shipping) => {
      return res.json(shipping)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getById(req: Request, res: Response) {
  const { shippingId, userId } = req.params

  Shipping.findOne({
    _id: shippingId,
    customer: userId,
    deleted: false,
  })
    .then((shipping) => {
      return res.json(shipping)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getAllByUser(req: Request, res: Response) {
  const { userId } = req.params

  Shipping.find({
    customer: userId,
    'deletion.isDeleted': false,
  })
    .then((shipping) => {
      return res.json(shipping)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function edit(req: Request, res: Response) {
  const {
    id,
    name,
    country,
    provinceState,
    city,
    addressLine1,
    addressLine2,
    postalCode,
  } = req.body

  Shipping.findOneAndUpdate(
    {
      _id: id,
    },
    {
      name: {
        first: name.first,
        last: name.last,
      },
      country: country,
      provinceState: provinceState,
      city: city,
      addressLine1: addressLine1,
      addressLine2: addressLine2,
      postalCode: postalCode,
      updatedOn: Date.now(),
    },
    {
      runValidators: true,
    },
  )
    .then((billing) => {
      console.log('billing:', billing)
      return res.status(200).send({ ok: true })
    })
    .catch((err) => {
      console.error(err)
    })
}

export async function deleteShipping(req: Request, res: Response) {
  const { shippingId } = req.params

  try {
    Shipping.findOneAndUpdate(
      {
        _id: shippingId,
      },
      {
        'deletion.isDeleted': true,
        'deletion.when': Date.now(),
      },
      {
        runValidators: true,
      },
    ).then(() => {
      return res.status(200).send({ ok: true })
    })
  } catch (err) {
    console.error(err)
  }
}
