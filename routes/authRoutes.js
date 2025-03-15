const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/login", authController.login);

router.get("/check", authController.authenticateJWT, authController.checkAuth);

module.exports = router;
