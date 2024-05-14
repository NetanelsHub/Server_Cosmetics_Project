const router = require("express").Router()
const { addCategory ,getAllCategory } = require("../controller/category_controller")

router.post("/add",addCategory)
router.get("/getAll",getAllCategory)






module.exports = router