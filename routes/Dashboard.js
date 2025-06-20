const router = require('express').Router();
const auth = require('../middleware/Auth');
const ctrl = require('../controllers/Dashboard');

router.use(auth);

router.get('/stats', ctrl.getStats);
router.get('/activities', ctrl.getActivities);
router.get('/topproducts', ctrl.getTopProducts);

module.exports = router;