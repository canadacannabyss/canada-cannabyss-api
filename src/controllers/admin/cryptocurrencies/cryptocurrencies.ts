import { Request, Response } from 'express'
import _ from 'lodash'
import fetch from 'node-fetch'

import AcceptedPaymentMethod from '../../../models/acceptedPaymentMethod/AcceptedPaymentMethod'
import Admin from '../../../models/admin/Admin'

const verifyValidSymbol = async (symbol) => {
  try {
    const crypto = await AcceptedPaymentMethod.find({
      'cryptocurrency.symbol': symbol,
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

const getCurrentCryptocurrencyPrice = async (symbol) => {
  const response = await fetch(
    `${process.env.COIN_MARKET_CAP_API}/v1/cryptocurrency/quotes/latest?symbol=${symbol}&convert=CAD`,
    {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'X-CMC_PRO_API_KEY': `${process.env.COIN_MARKET_CAP_API_KEY}`,
      },
    },
  )

  const data = await response.json()
  return data
}

const getCryptocurrencyies = async (limit, sort) => {
  const response = await fetch(
    `${process.env.COIN_MARKET_CAP_API}/v1/cryptocurrency/map?limit=${limit}&sort=${sort}`,
    {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'X-CMC_PRO_API_KEY': `${process.env.COIN_MARKET_CAP_API_KEY}`,
      },
    },
  )

  const data = await response.json()
  return data
}

const getCryptocurrencyiesInfo = async (symbol) => {
  const response = await fetch(
    `${process.env.COIN_MARKET_CAP_API}/v1/cryptocurrency/info?symbol=${symbol}`,
    {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'X-CMC_PRO_API_KEY': `${process.env.COIN_MARKET_CAP_API_KEY}`,
      },
    },
  )

  const data = await response.json()
  return data
}

export function index(req: Request, res: Response) {
  AcceptedPaymentMethod.find({
    type: 'cryptocurrency',
    'deletion.isDeleted': false,
  })
    .then((acceptedPaymentMethods) => {
      return res.status(200).send(acceptedPaymentMethods)
    })
    .catch((err) => {
      console.error(err)
    })
}

export async function getCryptocurrencyiesController(
  req: Request,
  res: Response,
) {
  const { limit, sort } = req.query

  try {
    const promised = await Promise.all([getCryptocurrencyies(limit, sort)])

    const promisedWithLogo = promised[0].data.map(async (promise) => {
      const func = await getCryptocurrencyiesInfo(promise.symbol)

      return func
    })

    const resultPromisedWithLogo = await Promise.all(promisedWithLogo)

    const finalResult = resultPromisedWithLogo.map((test, index) => {
      return {
        index: index,
        symbol: promised[0].data[index].symbol,
        name: promised[0].data[index].name,
        logo: test.data[Object.keys(test.data)[0]].logo,
      }
    })

    return res.json({
      data: finalResult,
    })
  } catch (err) {
    console.error(err)
    return res.status(200).send({})
  }
}

export async function getEthPrice(req: Request, res: Response) {
  const ethPrice = await getCurrentCryptocurrencyPrice('ETH')
  console.log('data:', ethPrice)
  return res.json(ethPrice.data.ETH.quote.CAD.price)
}

export async function getBtcPrice(req: Request, res: Response) {
  const btcPrice = await getCurrentCryptocurrencyPrice('BTC')
  console.log('data:', btcPrice)
  return res.json(btcPrice.data.BTC.quote.CAD.price)
}

export async function getPrice(req: Request, res: Response) {
  const { symbol } = req.query

  const cryptoPrice = await getCurrentCryptocurrencyPrice(symbol)
  console.log('data:', cryptoPrice)
  return res.json(cryptoPrice.data[symbol].quote.CAD.price)
}

export async function getTotalCryptocurrency(req: Request, res: Response) {
  const { totalInFiat, cryptocurrencySymbol } = req.body

  let cryptocurrencyPrice
  let totalInCryptocurrency

  if (cryptocurrencySymbol === 'BTC') {
    cryptocurrencyPrice = await getCurrentCryptocurrencyPrice('BTC')
    totalInCryptocurrency = (
      totalInFiat / cryptocurrencyPrice.data.BTC.quote.CAD.price
    ).toFixed(8)
  } else if (cryptocurrencySymbol === 'ETH') {
    cryptocurrencyPrice = await getCurrentCryptocurrencyPrice('ETH')
    totalInCryptocurrency = (
      totalInFiat / cryptocurrencyPrice.data.ETH.quote.CAD.price
    ).toFixed(8)
  }

  console.log('totalInCryptocurrency:', totalInCryptocurrency)
  return res.status(200).send({ totalInCryptocurrency })
}

export function validateSymbol(req: Request, res: Response) {
  const { symbol } = req.params
  const verificationRes = verifyValidSymbol(symbol)
  return res.json({
    valid: verificationRes,
  })
}

export function symbol(req: Request, res: Response) {
  const { symbol } = req.params
  console.log('sybol:', symbol)

  AcceptedPaymentMethod.findOne({
    'cryptocurrency.symbol': symbol,
    'deletion.isDeleted': false,
  })
    .then((acceptedPaymentMethod) => {
      console.log('acceptedPaymentMethod:', acceptedPaymentMethod)
      return res.status(200).send(acceptedPaymentMethod)
    })
    .catch((err) => {
      console.error(err)
    })
}

export function create(req: Request, res: Response) {
  const { logo, symbol, name, address, admin, discount } = req.body

  console.log('req.body:', req.body)

  let newAcceptedPaymentMethod

  if (discount !== null || discount !== undefined) {
    newAcceptedPaymentMethod = new AcceptedPaymentMethod({
      admin,
      type: 'cryptocurrency',
      cryptocurrency: {
        logo,
        symbol,
        name,
        address,
        discount,
      },
    })
  } else {
    newAcceptedPaymentMethod = new AcceptedPaymentMethod({
      admin,
      type: 'cryptocurrency',
      cryptocurrency: {
        logo,
        symbol,
        name,
        address,
      },
    })
  }

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

export function deleteCryptocurrencies(req: Request, res: Response) {
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
