const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');

app.use(cors());

const Cart = require('../../../models/cart/Cart');
const Product = require('../../../models/product/Product');
const Bundle = require('../../../models/bundle/Bundle');

// const authMiddleware = require('../../../middleware/auth');

// app.use(authMiddleware);

const arraysEqual = (_arr1, _arr2) => {
  if (
    !Array.isArray(_arr1) ||
    !Array.isArray(_arr2) ||
    _arr1.length !== _arr2.length
  )
    return false;

  var arr1 = _arr1.concat().sort();
  var arr2 = _arr2.concat().sort();

  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
};

app.post('/create/cart', async (req, res) => {
  const { userId } = req.body;
  console.log('userId:', userId);
  const newCart = new Cart({
    products: [],
    customer: userId,
  });

  newCart
    .save()
    .then((cart) => {
      res.json(cart);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/get/cart/user/:userId', async (req, res) => {
  const { userId } = req.params;
  Cart.findOne({
    customer: userId,
    paid: false,
    completed: false,
  })
    .then((cart) => {
      if (cart === null) {
        res.json(null);
      } else {
        res.json(cart);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/get/cart/:cartId', async (req, res) => {
  const { cartId } = req.params;
  Cart.findOne({
    _id: cartId,
    paid: false,
    completed: false,
  })
    .then((cart) => {
      if (cart === null) {
        res.json(null);
      } else {
        res.json(cart);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put('/add/item', async (req, res) => {
  const { item, cartId } = req.body;
  console.log('item added:', item);
  try {
    const cart = await Cart.findOne({
      _id: cartId,
    });
    let found = false;
    let itemsObjsArray = cart.items;
    itemsObjsArray.map((itemObj) => {
      if (item.variant.length === 0) {
        if (itemObj._id === item._id) {
          itemObj.quantity += item.quantity;
          found = true;
        }
      } else {
        const tempItemobj = [];
        itemObj.variant.map((variant) => {
          tempItemobj.push(variant);
        });
        if (
          itemObj._id === item._id &&
          arraysEqual(tempItemobj, item.variant)
        ) {
          itemObj.quantity += item.quantity;
          found = true;
        }
      }
    });

    if (found) {
      await Cart.updateOne(
        {
          _id: cartId,
        },
        {
          items: itemsObjsArray,
        },
        {
          runValidators: true,
        }
      );
    } else {
      await Cart.updateOne(
        {
          _id: cartId,
        },
        {
          $push: { items: item },
        },
        {
          runValidators: true,
        }
      );
    }

    const cartNew = await Cart.findOne({
      _id: cartId,
    });
    console.log('cartNew:', cartNew);
    res.json(cartNew.items);
  } catch (err) {
    console.log(err);
  }
});

app.put('/remove/item', async (req, res) => {
  const { item, cartId } = req.body;
  console.log('item:', item);
  console.log('cartId:', cartId);
  try {
    const cart = await Cart.findOne({
      _id: cartId,
    });
    console.log('cart:', cart);
    let itemIndex = 0;
    let itemsObjsArray = cart.items;
    itemsObjsArray.map((itemObj, index) => {
      if (itemObj._id === item._id) {
        itemsObjsArray.splice(index, index + 1);
      }
    });

    await Cart.updateOne(
      {
        _id: cartId,
      },
      {
        items: itemsObjsArray,
      },
      {
        runValidators: true,
      }
    );

    const cartNew = await Cart.findOne({
      _id: cartId,
    });
    console.log('cartNew:', cartNew);
    res.json(cartNew.items);
  } catch (err) {
    console.log(err);
  }
});

app.put('/update/completed', async (req, res) => {
  const { cartId } = req.body;

  console.log('cartId:', cartId);
  try {
    await Cart.findOneAndUpdate(
      {
        _id: cartId,
      },
      {
        completed: true,
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      }
    );

    const cart = await Cart.findOne({
      _id: cartId,
    });

    console.log(cart);

    res.status(200).send(cart.completed);
  } catch (err) {
    console.log(err);
  }
});

app.put('/update/purchased', async (req, res) => {
  const { cartId } = req.body;

  try {
    const cartObj = await Cart.findOne({
      _id: cartId,
    });

    cartObj.items.map(async (item) => {
      if (item.type === 'product') {
        const productObj = await Product.findOne({
          _id: item._id,
        });
        await Product.findOneAndUpdate(
          {
            _id: item._id,
          },
          {
            'inventory.quantity': productObj.inventory.quantity - item.quantity,
            updatedOn: Date.now(),
          },
          {
            runValidators: true,
          }
        );
      } else if (item.type === 'bundle') {
        const bundleObj = await Bundle.findOne({
          _id: item._id,
        });
        await Bundle.findOneAndUpdate(
          {
            _id: item._id,
          },
          {
            'inventory.quantity': bundleObj.inventory.quantity - item.quantity,
            updatedOn: Date.now(),
          },
          {
            runValidators: true,
          }
        );
      }
    });

    const updatedCartObj = await Cart.findOne({
      _id: cartId,
    });

    res.status(200).send(updatedCartObj);
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
