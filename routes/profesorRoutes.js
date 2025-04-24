const express = require("express")
const profesorController = require("../controllers/profesorController")
const { authenticateJWT } = require("../controllers/authController");

const router = express.Router()


router.post("/inregistrare", profesorController.creeazaProfesor)

router.post("/assign/:idtest/:idelev", authenticateJWT, profesorController.assignTema)

router.get("/assignments", authenticateJWT, profesorController.getAssignments);

router.delete('/stergeretema/:idtema',authenticateJWT,profesorController.deleteAssignment);

module.exports = router;