const router = require("express").Router();
const { addProduct ,getAllProduct ,deleteProduct,updateProduct,getProductsByCategory} = require("../controller/product_controller")
const upload = require("../middleware/multer")

router.post("/add",upload.single('product_image'),addProduct)
router.get("/getAllProducts",getAllProduct)
router.get("/getProductsByCategory",getProductsByCategory)
router.delete("/delete/:id",deleteProduct);
router.put("/update/:id",upload.single('product_image'),updateProduct);




module.exports = router;