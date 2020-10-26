const express = require('express');
const router = express.Router();

const multer = require('multer');
const multerConfig = require('../../../config/multerCategory');

const AdminCategoriesController = require('../../../controllers/admin/categories/categories')

router.get('', AdminCategoriesController.index);

router.get('/panel/get/:slug', AdminCategoriesController.panelGetBySlug);

router.get('/sync', AdminCategoriesController.sync);

router.get('/validation/slug/:slug', AdminCategoriesController.validateSlug);

router.post('/publish', AdminCategoriesController.publish);

router.put('/update/:id', AdminCategoriesController.update);

router.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  AdminCategoriesController.uploadMedia
);

router.post('/set/global-variable', AdminCategoriesController.setGlobalVariable);

// Update Category Cover
router.get('/get/cover/:id', AdminCategoriesController.getMedia);

// Update Category Cover
router.put('/update/cover/:id', AdminCategoriesController.updateMedia);

// Delete Category
router.delete('/delete/category/:categoryId', AdminCategoriesController.delete);

// Delete Category Cover
router.delete('/delete/media/:id', AdminCategoriesController.deleteMedia);

module.exports = router;
