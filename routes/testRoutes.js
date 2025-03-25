const express = require("express");
const testController = require("../controllers/testController");
const router = express.Router();

router.post("/add", testController.addExercise);

module.exports = router;
