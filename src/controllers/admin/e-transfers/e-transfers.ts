import { Request, Response } from 'express'
import _ from 'lodash'
import fetch from 'node-fetch'

import AcceptedPaymentMethod from '../../../models/acceptedPaymentMethod/AcceptedPaymentMethod'
import Admin from '../../../models/admin/Admin'

const verifyValidETransfer = async (recipientEmail) => {
  try {
    const crypto = await AcceptedPaymentMethod.find({
      'eTransfer.recipient': recipientEmail,
      'deletion.isDeleted': false,
    })
    console.log('crypto:', crypto)
    if (!_.isEmpty(crypto)) {
      return false
    } else {
      return true
    }
  } catch (err) {
    console.log(err)
  }
}

export function index(req: Request, res: Response) {
  AcceptedPaymentMethod.find({
    type: 'e-transfer',
    'deletion.isDeleted': false,
  })
    .then((acceptedPaymentMethods) => {
      return res.status(200).send(acceptedPaymentMethods)
    })
    .catch((err) => {
      console.error(err)
    })
}

export async function validateRecipientEmail(req: Request, res: Response) {
  const { recipientEmail } = req.params
  const verificationRes = await verifyValidETransfer(recipientEmail)
  console.log('verificationRes:', verificationRes)
  return res.json({
    valid: verificationRes,
  })
}

export function create(req: Request, res: Response) {
  const { recipient, admin } = req.body

  const newAcceptedPaymentMethod = new AcceptedPaymentMethod({
    admin,
    type: 'e-transfer',
    eTransfer: {
      recipient,
    },
  })

  newAcceptedPaymentMethod
    .save()
    .then(() => {
      return res.status(201).send({
        ok: true,
      })
    })
    .catch((err) => {
      console.error(err)
    })
}

export function deleteETransfer(req: Request, res: Response) {
  const { id } = req.params

  AcceptedPaymentMethod.findOneAndUpdate(
    {
      _id: id,
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
