const router = require("express").Router();
const { addProduct} = require("../controller/product_controller")
const upload = require("../middleware/multer")
 
router.post("/add",upload.single('product_image'),addProduct)




module.exports = router;