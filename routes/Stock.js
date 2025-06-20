const router = require('express').Router();
const auth = require('../middleware/Auth');
const ctrl = require('../controllers/Stock');

router.use(auth);
router.post('/add', ctrl.addStock);
router.post('/subtract', ctrl.reduceStock);
router.post('/recount', ctrl.recountStock);
router.post('/set_quantity', ctrl.setStockQuantity);
router.get('/all', ctrl.getAllStockWithProduct);
router.get('/:productId', ctrl.getStock);

module.exports = router;