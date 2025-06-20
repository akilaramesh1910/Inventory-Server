const router = require('express').Router();
const auth = require('../middleware/Auth');
const ctrl = require('../controllers/Order');

router.use(auth);
router.post('/', ctrl.createOrder);
router.get('/', ctrl.getOrders);

module.exports = router;