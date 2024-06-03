const router = require("express").Router()
const {AddFirstAdmin,loginAdmin,autoAdmin,addASuperUser,getSuperUser,deleteSuperUser,updateSuperUser,logoutAdmin,ForgotPassword,ResetPassword} = require("../controller/admin_controller")
const jwtAuth = require ("../middleware/jwt")


router.post("/addFirstAdmin",AddFirstAdmin)
router.post("/login",loginAdmin)
router.get("/logout",logoutAdmin)
router.post("/addSuperUser",addASuperUser)
router.get("/getSuperUser",getSuperUser)
router.delete("/deleteSuperUser/:id",deleteSuperUser)
router.put("/updateSuperUser/:id",updateSuperUser)

router.post("/forgotPassword",ForgotPassword);
router.post("/resetPassword",ResetPassword);

router.get("/auth", jwtAuth,autoAdmin) 

module.exports = router