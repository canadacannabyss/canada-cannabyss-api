const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const process = require('process');
const bodyParser = require('body-parser');

// environment variables
process.env.NODE_ENV = 'development';
// process.env.NODE_ENV = 'staging';
// process.env.NODE_ENV = 'testing';
// process.env.NODE_ENV = 'production';

// config variables
const config = require('./config/config');

require('dotenv').config();

const app = express();
app.use(cors());

app.use(
  bodyParser.json({
    limit: '50mb',
  })
);

app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: false,
  })
);

mongoose.set('useFindAndModify', false);

// Express session
// app.use(
//   session({
//     secret: 'secret',
//     resave: true,
//     saveUninitialized: true,
//   })
// );

// Switch file storage from development to production
app.use(morgan('dev'));
app.use(
  '/files',
  express.static(path.resolve(__dirname, '.', 'tmp', 'uploads'))
);

// Routes
app.use('/search', require('./routes/search'));
app.use('/home', require('./routes/home'));
app.use('/products', require('./routes/products'));
app.use('/promotions', require('./routes/promotions'));
app.use('/bundles', require('./routes/bundles'));
app.use('/categories', require('./routes/categories'));
app.use('/customers', require('./routes/customers/customers'));
app.use('/resellers', require('./routes/resellers'));

app.use('/customers/cart', require('./routes/customers/cart/cart'));
app.use('/customers/order', require('./routes/customers/order/order'));
app.use('/customers/orders', require('./routes/customers/orders/orders'));
app.use('/customers/comments', require('./routes/customers/reviews/reviews'));
app.use('/customers/billing', require('./routes/customers/billing/billing'));
app.use('/customers/shipping', require('./routes/customers/shipping/shipping'));
app.use(
  '/customers/payment-method',
  require('./routes/customers/paymentMethod/paymentMethod')
);
app.use(
  '/customers/recommended',
  require('./routes/customers/recommended/recommended')
);

app.use('/admin/products', require('./routes/admin/products/products'));
app.use('/admin/bundles', require('./routes/admin/bundles/bundles'));
app.use('/admin/promotions', require('./routes/admin/promotions/promotions'));
app.use(
  '/admin/promotions/banners',
  require('./routes/admin/promotions/banners/banners')
);
app.use(
  '/admin/cryptocurrencies',
  require('./routes/admin/cryptocurrencies/cryptocurrencies')
);
app.use('/admin/e-transfers', require('./routes/admin/e-transfers/e-transfer'));
app.use('/admin/category', require('./routes/admin/category/category'));
app.use('/admin/categories', require('./routes/admin/categories/categories'));
app.use('/admin/orders', require('./routes/admin/orders/orders'));
app.use('/admin/coupons', require('./routes/admin/coupons/coupons'));
app.use(
  '/admin/postal-services',
  require('./routes/admin/postalServices/postalServices')
);
app.use('/admin', require('./routes/admin/index'));

app.use('/reseller/products', require('./routes/reseller/products/products'));
app.use('/reseller/bundles', require('./routes/reseller/bundles/bundles'));
app.use(
  '/reseller/promotions',
  require('./routes/reseller/promotions/promotions')
);
app.use(
  '/reseller/promotions/banners',
  require('./routes/reseller/promotions/banners/banners')
);
app.use('/reseller/category', require('./routes/reseller/category/category'));
app.use(
  '/reseller/categories',
  require('./routes/reseller/categories/categories')
);
app.use('/reseller/orders', require('./routes/reseller/orders/orders'));
app.use('/reseller/coupons', require('./routes/reseller/coupons/coupons'));
app.use('/reseller', require('./routes/reseller/index'));

app.use('/addresses', require('./routes/addresses/addresses'));

app.use(
  '/cryptocurrencies',
  require('./routes/cryptocurrencies/cryptocurrencies')
);

app.use('/invoices', require('./routes/invoices/invoices'));

const port = process.env.PORT || global.gConfig.node_port;

app.listen(port, () => {
  console.log(`${global.gConfig.app_name} is listening on port: ${port}`);
});
