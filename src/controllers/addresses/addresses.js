const Canada = require('../../utils/addresses/canada')

const canada = new Canada();

module.exports = {
  getAllProvinces: (req, res) => {
    return res.status(200).send(canada.getAllProvinces())
  },
  getAllCities: (req, res) => {
    return res.status(200).send(canada.getAllCities())
  },
  getAllCitiesFromProvince: (req, res) => {
    const { province } = req.params;

    let citiesArray = canada.getAllCities();
    let result = citiesArray.filter((item) => {
      return item[1] === province;
    })
      .map((a) => {
        return a[0];
      });
    return res.status(200).send(result);
  }
}