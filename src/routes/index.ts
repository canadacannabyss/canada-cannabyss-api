import { Application } from 'express'

import search from './search'
import home from './home'
import products from './products'
import promotions from './promotions'
import bundles from './bundles'
import categories from './categories'
import resellers from './resellers'

import customers from './customers/customers'
import customersCart from './customers/cart/cart'
import customersOrder from './customers/order/order'
import customersOrders from './customers/orders/orders'
import customersComments from './customers/reviews/reviews'
import customersBilling from './customers/billing/billing'
import customersShipping from './customers/shipping/shipping'
import customersPaymentMethod from './customers/paymentMethod/paymentMethod'
import customersRecommended from './customers/recommended/recommended'

import admin from './admin/index'
import adminProducts from './admin/products/products'
import adminBundles from './admin/bundles/bundles'
import adminPromotions from './admin/promotions/promotions'
import adminPromotionsBanners from './admin/promotions/banners/banners'
import adminCryptocurrencies from './admin/cryptocurrencies/cryptocurrencies'
import adminETransfers from './admin/e-transfers/e-transfer'
import adminCategory from './admin/category/category'
import adminCategories from './admin/categories/categories'
import adminOrders from './admin/orders/orders'
import adminCoupons from './admin/coupons/coupons'
import adminPostalServices from './admin/postalServices/postalServices'

import reseller from './reseller/index'
import resellersProducts from './reseller/products/products'
import resellersBundles from './reseller/bundles/bundles'
import resellersPromotions from './reseller/promotions/promotions'
import resellersBanners from './reseller/promotions/banners/banners'
import resellersCategory from './reseller/category/category'
import resellersCategories from './reseller/categories/categories'
import resellersOrders from './reseller/orders/orders'
import resellersCoupons from './reseller/coupons/coupons'

import addresses from './addresses/addresses'
import cryptocurrencies from './cryptocurrencies/cryptocurrencies'
import invoices from './invoices/invoices'

export default (app: Application): void => {
  // Routes
  app.use('/search', search)
  app.use('/home', home)
  app.use('/products', products)
  app.use('/promotions', promotions)
  app.use('/bundles', bundles)
  app.use('/categories', categories)
  app.use('/resellers', resellers)

  app.use('/customers', customers)
  app.use('/customers/cart', customersCart)
  app.use('/customers/order', customersOrder)
  app.use('/customers/orders', customersOrders)
  app.use('/customers/comments', customersComments)
  app.use('/customers/billing', customersBilling)
  app.use('/customers/shipping', customersShipping)
  app.use('/customers/payment-method', customersPaymentMethod)
  app.use('/customers/recommended', customersRecommended)

  app.use('/admin', admin)
  app.use('/admin/products', adminProducts)
  app.use('/admin/bundles', adminBundles)
  app.use('/admin/promotions', adminPromotions)
  app.use('/admin/promotions/banners', adminPromotionsBanners)
  app.use('/admin/cryptocurrencies', adminCryptocurrencies)
  app.use('/admin/e-transfers', adminETransfers)
  app.use('/admin/category', adminCategory)
  app.use('/admin/categories', adminCategories)
  app.use('/admin/orders', adminOrders)
  app.use('/admin/coupons', adminCoupons)
  app.use('/admin/postal-services', adminPostalServices)

  app.use('/reseller', reseller)
  app.use('/reseller/products', resellersProducts)
  app.use('/reseller/bundles', resellersBundles)
  app.use('/reseller/promotions', resellersPromotions)
  app.use('/reseller/promotions/banners', resellersBanners)
  app.use('/reseller/category', resellersCategory)
  app.use('/reseller/categories', resellersCategories)
  app.use('/reseller/orders', resellersOrders)
  app.use('/reseller/coupons', resellersCoupons)

  app.use('/addresses', addresses)
  app.use('/cryptocurrencies', cryptocurrencies)
  app.use('/invoices', invoices)
}
