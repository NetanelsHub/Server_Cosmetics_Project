const router = require("express").Router();
const { addOrder, getOrder,updateStatus } = require("../controller/order_controller");


router.post('/addOrder', addOrder)
router.get('/getOrder', getOrder)
router.put("/update/:status",updateStatus)

module.exports = router;