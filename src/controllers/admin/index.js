const uuidv4 = require('uuid/v4')
const multer = require('multer')
const multerConfig = require('../../config/multer/multer')
const slugify = require('slugify')
const _ = require('lodash')

const Product = require('../../models/product/Product')
const ProductMedia = require('../../models/product/ProductMedia')
const Category = require('../../models/category/Category')
const CategoryMedia = require('../../models/category/CategoryMedia')
const Bundle = require('../../models/bundle/Bundle')
const Promotion = require('../../models/promotion/Promotion')
const PromotionMedia = require('../../models/promotion/PromotionMedia')
const Banner = require('../../models/banner/Banner')

module.exports = {
  getAllProducts: async (req, res) => {
    Product.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'media',
        model: ProductMedia,
      })
      .then((products) => {
        return res.status(200).send(products)
      })
      .catch((err) => {
        console.log(err)
        return res.status(500).send(err)
      })
  },

  getAllBundles: async (req, res) => {
    Bundle.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'products',
        model: Product,
        populate: {
          path: 'media',
          model: ProductMedia,
        },
      })
      .then((bundles) => {
        return res.status(200).send(bundles)
      })
      .catch((err) => {
        console.log(err)
        return res.status(500).send(err)
      })
  },

  getAllPromotions: async (req, res) => {
    Promotion.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'media',
        model: PromotionMedia,
      })
      .then((promotions) => {
        return res.status(200).send(promotions)
      })
      .catch((err) => {
        console.log(err)
        return res.status(500).send(err)
      })
  },

  getAllBanners: async (req, res) => {
    Banner.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'promotions',
        model: Promotion,
        populate: {
          path: 'media',
          model: PromotionMedia,
        },
      })
      .then((banners) => {
        return res.status(200).send(banners)
      })
      .catch((err) => {
        console.log(err)
        return res.status(500).send(err)
      })
  },

  getCategoriesProducts: async (req, res) => {
    Category.find({
      'deletion.isDeleted': false,
    })
      // .sort({howManyViewed: 1})
      .then((categories) => {
        let categoriesList = []
        categories.map((category) => {
          categoriesList.push({
            categoryName: category.categoryName,
            slug: category.slug,
          })
        })
        console.log(categoriesList)
        return res.json(categoriesList)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  getCategoriesPromotions: async (req, res) => {
    Category.find({
      'deletion.isDeleted': false,
    })
      // .sort({howManyViewed: 1})
      .then((categories) => {
        let categoriesList = []
        categories.map((category) => {
          categoriesList.push({
            categoryName: category.categoryName,
            slug: category.slug,
          })
        })
        console.log(categoriesList)
        return res.json(categoriesList)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  getCategoriesBanners: async (req, res) => {
    Category.find({
      'deletion.isDeleted': false,
    })
      // .sort({howManyViewed: 1})
      .then((categories) => {
        let categoriesList = []
        categories.map((category) => {
          categoriesList.push({
            categoryName: category.categoryName,
            slug: category.slug,
          })
        })
        console.log(categoriesList)
        return res.json(categoriesList)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  getProductsByCategory: async (req, res) => {
    const { category } = req.params

    Product.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'media',
        model: ProductMedia,
      })
      .populate({
        path: 'organization.category',
        model: Category,
      })
      .then((products) => {
        let productsList = []
        products.map((product) => {
          if (product.organization.category !== null) {
            if (product.organization.category.slug === category) {
              productsList.push(product)
            }
          }
        })
        return res.status(200).send(productsList)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  getBundlesByCategory: async (req, res) => {
    const { category } = req.params
    Bundle.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'products',
        model: Product,
        populate: {
          path: 'media',
          model: ProductMedia,
        },
      })
      .populate({
        path: 'organization.category',
        model: Category,
      })
      .then((bundles) => {
        let bundlesList = []
        bundles.map((bundle) => {
          if (bundle.organization.category !== null) {
            if (bundle.organization.category.slug === category) {
              bundlesList.push(bundle)
            }
          }
        })
        return res.status(200).send(bundlesList)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  getPromotionsByCategory: async (req, res) => {
    const { category } = req.params
    Promotion.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'media',
        model: PromotionMedia,
      })
      .populate({
        path: 'organization.category',
        model: Category,
      })
      .then((promotions) => {
        let promotionsList = []
        promotions.map((promotion) => {
          console.log('promotions:', promotions)
          if (promotion.organization.category !== null) {
            if (promotion.organization.category.slug === category) {
              promotionsList.push(promotion)
            }
          }
        })
        return res.status(200).send(promotionsList)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  getBannersByCategory: async (req, res) => {
    const { category } = req.params
    Banner.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'promotions',
        model: Promotion,
        populate: {
          path: 'media',
          model: PromotionMedia,
        },
      })
      .populate({
        path: 'organization.category',
        model: Category,
      })
      .then((banners) => {
        let bannersList = []
        banners.map((banner) => {
          if (banner.organization.category !== null) {
            if (banner.organization.category.slug === category) {
              bannersList.push(banner)
            }
          }
        })
        return res.status(200).send(bannersList)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  getCategoriesBundles: async (req, res) => {
    Category.find({
      'deletion.isDeleted': false,
    })
      // .sort({howManyViewed: 1})
      .then((categories) => {
        let categoriesList = []
        categories.map((category) => {
          categoriesList.push({
            categoryName: category.categoryName,
            slug: category.slug,
          })
        })
        console.log(categoriesList)
        return res.json(categoriesList)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  getBundlesByCategory: async (req, res) => {
    const { category } = req.params

    Bundle.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'products',
        model: Product,
        populate: {
          path: 'media',
          model: ProductMedia,
        },
      })
      .populate({
        path: 'organization.category',
        model: Category,
      })
      .then((bundles) => {
        let bundlesList = []
        bundles.map((bundle) => {
          if (bundle.organization.category !== null) {
            if (bundle.organization.category.slug === category) {
              bundlesList.push(bundle)
            }
          }
        })
        return res.status(200).send(bundlesList)
      })
  },
}
