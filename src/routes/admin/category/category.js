const express = require('express');
const router = express.Router();

const multer = require('multer');
const multerConfig = require('../../../config/multerCategory');

const AdminCategoryController = require('../../../controllers/admin/category/category')

router.get('', AdminCategoryController.index);

router.get('/panel/get/:slug', AdminCategoryController.panelGetBySlug);

router.get('/sync', AdminCategoryController.sync);

router.get('/validation/slug/:slug',);

router.post('/publish', AdminCategoryController.publish);

router.put('/update/:id', AdminCategoryController.update);

router.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  AdminCategoryController.uploadMedia
);

router.post('/set/global-variable', AdminCategoryController.setGlobalVariable);

router.get('/get/cover/:id', AdminCategoryController.getMedia);

router.put('/update/cover/:id', AdminCategoryController.updateMedia);

router.put('/delete/category/:categoryId', AdminCategoryController.delete);

router.put('/delete/media/:id', AdminCategoryController.deleteMedia);

module.exports = router;
