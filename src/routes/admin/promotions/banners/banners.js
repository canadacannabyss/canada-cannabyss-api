const express = require('express');
const router = express.Router();

const AdminBannerController = require('../../../../controllers/admin/promotions/banners/banners')

router.get('', AdminBannerController.index);

router.get('/validation/slug/:slug', AdminBannerController.validateSlug);

router.post('/publish', AdminBannerController.publish);

router.post('/set/global-variable', AdminBannerController.setGlobalVariable);

router.put('/delete/banner/:bannerId', AdminBannerController.delete);

router.put('/update/:id', AdminBannerController.update);

// Delete Podcast
router.delete('/delete/:id', AdminBannerController.oldDelete);

router.delete('/delete/cover/:id', AdminBannerController.deleteMedia);

router.get('/panel/get/:slug', AdminBannerController.panelGetBySlug);

router.get('/:slug', AdminBannerController.getSlug);

module.exports = router;
