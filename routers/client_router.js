const router = require("express").Router();
const { registerClient ,loginClient, logOut ,authClient} = require("../controller/client_controller");
const jwtAuth = require ("../middleware/jwt")


router.post("/register",registerClient);
router.post("/login",loginClient);
router.get("/auth",jwtAuth,authClient)
router.get("/logout",logOut)

module.exports = router