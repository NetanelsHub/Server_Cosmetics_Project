const router = require("express").Router()
const {AddFirstAdmin,loginAdmin,autoAdmin,addASuperUser} = require("../controller/admin_controller")
const jwtAuth = require ("../middleware/jwt")


router.post("/addFirstAdmin",AddFirstAdmin)
router.post("/login",loginAdmin)
router.post("/addSuperUser",addASuperUser)

// router.get("/logout",logOutAdmin)
// router.post("/login/resetPass",Reset_password)

router.get("/auth", jwtAuth,autoAdmin) 

module.exports = router