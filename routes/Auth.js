const router = require('express').Router();
const auth = require('../middleware/Auth');

const { login, register, getUserDetails, logout } = require('../controllers/Auth');

router.post('/login', login);
router.post('/register', register);
router.get('/me', auth, getUserDetails);
router.post('/logout', logout);

module.exports = router;