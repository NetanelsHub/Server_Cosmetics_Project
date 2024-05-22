const router = require("express").Router()
const { addCategory ,getAllCategory ,deleteCategory ,updateCategory } = require("../controller/category_controller")

router.post("/add",addCategory)
router.get("/getAll",getAllCategory)
router.delete("/delete/:id",deleteCategory)
router.put("/update/:id",updateCategory)






module.exports = router