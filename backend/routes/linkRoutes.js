const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/linkController');
router.use(auth);
router.get('/summary', c.summary);
router.route('/').get(c.list).post(c.create);
router.get('/:id/stats', c.stats);
router.delete('/:id', c.remove);
module.exports = router;
