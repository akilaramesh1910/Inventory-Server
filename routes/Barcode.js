const router = require('express').Router();
const auth = require('../middleware/Auth');
const { generateBarcode } = require('../controllers/Barcode');

router.use(auth);
router.post('/generate', generateBarcode);

module.exports = router;