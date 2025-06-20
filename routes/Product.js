const router = require('express').Router();
const auth = require('../middleware/Auth');
const ctrl = require('../controllers/Product');

router.use(auth);
router.post('/', ctrl.addProduct);
router.get('/', ctrl.getProducts);
router.put('/:id', ctrl.updateProduct);
router.delete('/:id', ctrl.deleteProduct);

module.exports = router;