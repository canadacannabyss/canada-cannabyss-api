import { Application } from 'express'

import search from '../routes/search'
import home from '../routes/home'
import products from '../routes/products'
import promotions from '../routes/promotions'
import bundles from '../routes/bundles'
import categories from '../routes/categories'
import resellers from '../routes/resellers'

import customers from '../routes/customers/customers'
import customersCart from '../routes/customers/cart/cart'
import customersOrder from '../routes/customers/order/order'
import customersOrders from '../routes/customers/orders/orders'
import customersComments from '../routes/customers/reviews/reviews'
import customersBilling from '../routes/customers/billing/billing'
import customersShipping from '../routes/customers/shipping/shipping'
import customersPaymentMethod from '../routes/customers/paymentMethod/paymentMethod'
import customersRecommended from '../routes/customers/recommended/recommended'

import admin from '../routes/admin/index'
import adminProducts from '../routes/admin/products/products'
import adminBundles from '../routes/admin/bundles/bundles'
import adminPromotions from '../routes/admin/promotions/promotions'
import adminPromotionsBanners from '../routes/admin/promotions/banners/banners'
import adminCryptocurrencies from '../routes/admin/cryptocurrencies/cryptocurrencies'
import adminETransfers from '../routes/admin/e-transfers/e-transfer'
import adminCategory from '../routes/admin/category/category'
import adminCategories from '../routes/admin/categories/categories'
import adminOrders from '../routes/admin/orders/orders'
import adminCoupons from '../routes/admin/coupons/coupons'
import adminPostalServices from '../routes/admin/postalServices/postalServices'

import reseller from '../routes/reseller/index'
import resellersProducts from '../routes/reseller/products/products'
import resellersBundles from '../routes/reseller/bundles/bundles'
import resellersPromotions from '../routes/reseller/promotions/promotions'
import resellersBanners from '../routes/reseller/promotions/banners/banners'
import resellersCategory from '../routes/reseller/category/category'
import resellersCategories from '../routes/reseller/categories/categories'
import resellersOrders from '../routes/reseller/orders/orders'
import resellersCoupons from '../routes/reseller/coupons/coupons'

import addresses from '../routes/addresses/addresses'
import cryptocurrencies from '../routes/cryptocurrencies/cryptocurrencies'
import invoices from '../routes/invoices/invoices'

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

  app.use('/reseller', resellers)
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
