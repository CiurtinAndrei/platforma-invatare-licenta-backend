const { Exercitii } = require("../models");

exports.addExercise = async (req, res) => {
    try {
        const { clasa, capitol, subcapitol, cerinta, rezolvare } = req.body;
        
        if (!clasa || !capitol || !subcapitol || !cerinta || !rezolvare) {
            return res.status(400).json({ error: "Toate câmpurile sunt necesare." });
        }
        
        const newExercise = await Exercitii.create({
            clasa,
            capitol,
            subcapitol,
            punctaj: 5,
            cerinta,
            rezolvare
        });
        
        res.status(201).json({ message: "Exercițiu adăugat cu succes!", exercise: newExercise });
    } catch (error) {
        res.status(500).json({ error: "Eroare la adăugarea exercițiului.", details: error.message });
    }
};