const express = require('express');
const router = express.Router();

const ResellerBannersController = require('../../../../controllers/reseller/promotions/banners/banners')

router.get('', ResellerBannersController.index);

router.get('/validation/slug/:slug', ResellerBannersController.validateSlug);

router.post('/publish', ResellerBannersController.create);

router.post('/set/global-variable', ResellerBannersController.setGlobalVariable);

router.delete('/delete/banner/:bannerId', ResellerBannersController.delete);

router.put('/update/:id', ResellerBannersController.update);

router.delete('/delete/:id', ResellerBannersController.oldDelete);

router.delete('/delete/cover/:id', ResellerBannersController.oldDeleteMedia);

router.get('/panel/get/:slug', ResellerBannersController.panelGetSlug);

router.get('/:slug', ResellerBannersController.getBySlug);

module.exports = router;
