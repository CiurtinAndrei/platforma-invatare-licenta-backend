const express = require("express");
const elevController = require("../controllers/elevController");

const router = express.Router();


router.post("/inregistrare", elevController.creeazaElev);

module.exports = router;
                