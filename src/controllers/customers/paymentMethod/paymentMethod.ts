import { Request, Response } from 'express'

import PaymentMethod from '../../../models/paymentMethod/PaymentMethod'

export async function getAllByUser(req: Request, res: Response) {
  const { userId } = req.params
  PaymentMethod.find({
    customer: userId,
  })
    .then((paymentMethods) => {
      return res.json(paymentMethods)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function createETransfer(req: Request, res: Response) {
  const { userId, recipient } = req.body

  const newPaymentMethod = new PaymentMethod({
    customer: userId,
    eTransfer: {
      recipient: recipient,
      isETransfer: true,
    },
  })

  newPaymentMethod
    .save()
    .then((paymentPayment) => {
      return res.status(200).send(paymentPayment)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getETransferReceiptByUser(req: Request, res: Response) {
  const { userId, recipient } = req.params
  PaymentMethod.findOne({
    customer: userId,
    eTransfer: {
      recipient: recipient,
      isETransfer: true,
    },
    deletion: {
      isDeleted: false,
    },
  })
    .then((paymentMethod) => {
      let paymentMethodObj = {}
      if (paymentMethod !== null) {
        paymentMethodObj = paymentMethod
      }
      return res.status(200).send(paymentMethodObj)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function createCryptocurrency(req: Request, res: Response) {
  const { userId, cryptocurrency } = req.body

  console.log(req.body)

  const newPaymentMethod = new PaymentMethod({
    customer: userId,
    eTransfer: false,
    cryptocurrency: {
      logo: cryptocurrency.logo,
      symbol: cryptocurrency.symbol,
      name: cryptocurrency.name,
      customerAddress: cryptocurrency.customerAddress,
      companyAddress: cryptocurrency.companyAddress,
      discount: {
        type: cryptocurrency.discount.type,
        amount: cryptocurrency.discount.amount,
      },
    },
  })

  newPaymentMethod
    .save()
    .then((paymentPayment) => {
      return res.status(200).send(paymentPayment)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getCryptocurrencyReceiptByUser(
  req: Request,
  res: Response,
) {
  const { userId } = req.params
  const { logo, symbol, name, customerAddress, companyAddress } = req.query
  console.log('req.body:', req.query)
  PaymentMethod.findOne({
    customer: userId,
    eTransfer: false,
    cryptocurrency: {
      logo,
      symbol,
      name,
      customerAddress,
      companyAddress,
    },
    'deletion.isDeleted': false,
  })
    .then((paymentMethod) => {
      let paymentMethodObj = {}
      if (paymentMethod !== null) {
        paymentMethodObj = paymentMethod
      }
      return res.status(200).send(paymentMethodObj)
    })
    .catch((err) => {
      console.log(err)
    })
}
