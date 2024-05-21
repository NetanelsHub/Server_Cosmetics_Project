const router = require("express").Router();
const { addOrder, getOrder } = require("../controller/order_controller");


router.post('/addOrder', addOrder)
router.get('/getOrder', getOrder)

module.exports = router;