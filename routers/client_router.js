const router = require("express").Router();
const { registerClient ,loginClient, logOut ,authClient,getAllClients, deleteClients,updateClient,ForgotPassword,ResetPassword} = require("../controller/client_controller");
const jwtAuth = require ("../middleware/jwt")


router.post("/register",registerClient);
router.post("/login",loginClient);
router.get("/auth",jwtAuth,authClient)
router.get("/logout",logOut)
router.get("/getClients",getAllClients)
router.delete("/delete/:id",deleteClients)
router.put("/update/:id",updateClient)
router.post("/forgotPassword",ForgotPassword);
router.post("/resetPassword",ResetPassword);



module.exports = router