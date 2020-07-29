const express = require('express');

const app = express();
const cors = require('cors');

app.use(cors());

const Canada = require('../../utils/addresses/canada');

// const authMiddleware = require('../../../middleware/auth');

// app.use(authMiddleware);

app.get('/get/all/provinces', async (req, res) => {
  const canada = new Canada();

  res.json(canada.getAllProvinces());
});

app.get('/get/all/cities', async (req, res) => {
  const canada = new Canada();

  res.json(canada.getAllCities());
});

app.get('/get/all/cities/from/:province', async (req, res) => {
  const { province } = req.params;
  const canada = new Canada();

  let array = canada.getAllCities(),
    result = array
      .filter((item) => {
        return item[1] === province;
      })
      .map((a) => {
        return a[0];
      });

  res.json(result);
});

module.exports = app;
