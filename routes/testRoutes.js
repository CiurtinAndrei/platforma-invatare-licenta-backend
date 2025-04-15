const express = require("express");
const testController = require("../controllers/testController");
const { authenticateJWT } = require("../controllers/authController");
const router = express.Router();

router.post("/add", testController.addExercise);
router.get("/exercitii", testController.getExercises);

router.post("/generate", authenticateJWT, testController.generateTest);
router.get("/all", authenticateJWT, testController.getTestsForProfessor);

module.exports = router;
