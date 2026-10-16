const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/keyController');
router.use(auth, auth.sessionOnly);
router.get('/', c.list);
router.post('/', c.create);
router.delete('/:id', c.revoke);
module.exports = router;
