const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/login", authController.login);

router.get("/check", authController.authenticateJWT, authController.checkAuth);

router.get("/user", authController.authenticateJWT, authController.getUserInfo);
    
router.post("/logout", authController.logout);


module.exports = router;
