const express = require("express");
const router = express.Router();
const elevController = require("../controllers/elevController");
const { authenticateJWT } = require("../controllers/authController");


router.post("/inregistrare", elevController.creeazaElev);


router.get("/unassigned", authenticateJWT, elevController.getUnassigned);
router.post("/enroll/:idelev", authenticateJWT, elevController.enroll);
router.get("/my", authenticateJWT, elevController.getMine);

module.exports = router;
