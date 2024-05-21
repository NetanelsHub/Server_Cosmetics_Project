const router = require("express").Router();
const { registerClient ,loginClient, logOut ,authClient,getAllClients, deleteClients} = require("../controller/client_controller");
const jwtAuth = require ("../middleware/jwt")


router.post("/register",registerClient);
router.post("/login",loginClient);
router.get("/auth",jwtAuth,authClient)
router.get("/logout",logOut)
router.get("/getClients",getAllClients)
router.delete("/delete/:id",deleteClients)


module.exports = router