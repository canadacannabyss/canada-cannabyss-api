const canada = require('canada');

class Canada {
  getAllProvinces() {
    return canada.provinces;
  }

  getAllCities() {
    return canada.cities;
  }
}

module.exports = Canada;
