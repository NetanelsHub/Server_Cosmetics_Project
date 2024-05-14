const router = require("express").Router();
const { addProduct ,getAllProduct ,deleteProduct} = require("../controller/product_controller")
const upload = require("../middleware/multer")
 
router.post("/add",upload.single('product_image'),addProduct)
router.get("/getAllProducts",getAllProduct)
router.delete("/delete/:id",deleteProduct);




module.exports = router;