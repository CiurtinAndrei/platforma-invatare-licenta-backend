const express = require("express")
const profesorController = require("../controllers/profesorController")

const router = express.Router()


router.post("/inregistrare", profesorController.creeazaProfesor)

module.exports = router;