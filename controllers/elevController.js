const bcrypt = require("bcrypt");
const { Profesori, Elevi } = require("../models");
const { Teme, Teste } = require("../models");

// existing registration
exports.creeazaElev = async (req, res) => {
  try {
    const { nume, prenume, adresa, email, telefon, scoala, parola, clasa } = req.body;

    const emailExistent = await Elevi.findOne({ where: { email } });
    const emailExistentLaProfesori = await Profesori.findOne({ where: { email } });
    if (emailExistent || emailExistentLaProfesori) {
      return res.status(400).json({ error: "Un utilizator cu acest e-mail este deja înregistrat!" });
    }

    const telExistent = await Elevi.findOne({ where: { telefon } });
    const telExistentLaProfesori = await Profesori.findOne({ where: { telefon } });
    if (telExistent || telExistentLaProfesori) {
      return res.status(400).json({ error: "Un utilizator cu acest nr de telefon este deja înregistrat!" });
    }

    const hashedPassword = await bcrypt.hash(parola, 10);

    await Elevi.create({
      nume,
      prenume,
      adresa,
      email,
      telefon,
      scoala: scoala || null,
      parola: hashedPassword,
      clasa,
    });

    res.status(201).json({ message: "Elev înregistrat cu succes!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eroare la înregistrarea acestui elev!" });
  }
};

// GET /api/elevi/unassigned
exports.getUnassigned = async (req, res) => {
  try {
    const elevi = await Elevi.findAll({
      where: { idprof: null },
      attributes: ["idelev", "nume", "prenume"]
    });
    const payload = elevi.map(e => ({
      idelev: e.idelev,
      fullName: `${e.nume} ${e.prenume}`
    }));
    res.status(200).json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eroare la obținerea elevilor nealocați." });
  }
};

// POST /api/elevi/enroll/:idelev
exports.enroll = async (req, res) => {
  try {
    const profesorId = req.user.id;      // ← use req.user.id from your JWT
    const { idelev } = req.params;
    const elev = await Elevi.findByPk(idelev);

    if (!elev) return res.status(404).json({ error: "Elev inexistent." });
    if (elev.idprof) return res.status(400).json({ error: "Elev deja înrolat." });

    elev.idprof = profesorId;
    await elev.save();
    res.status(200).json({ message: "Elev înrolat cu succes." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eroare la înrolarea elevului." });
  }
};

// GET /api/elevi/my
exports.getMine = async (req, res) => {
  try {
    const profesorId = req.user.id;      // ← from your JWT
    const elevi = await Elevi.findAll({
      where: { idprof: profesorId },
      attributes: ["idelev", "nume", "prenume", "clasa"]
    });
    const payload = elevi.map(e => ({
      idelev: e.idelev,
      fullName: `${e.nume} ${e.prenume}`,
      clasa: e.clasa
    }));
    res.status(200).json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eroare la obținerea elevilor înrolați." });
  }
};


exports.getTemeElev = async (req, res) => {
  try {
    const elevId = req.user.id;  

    
    const teme = await Teme.findAll({
      include: [
        {
          model: Teste,
          as: 'Test',  // Alias used in the association
          required: false,  // Allow Test to be null
          attributes: ['titlu', 'document', 'barem']
        }
      ],
      where: { idelev: elevId },  // Filter by student ID
      attributes: ['idtema', 'datatrimitere', 'status', 'rezolvare']  // Only these fields from Teme
    });

    const payload = teme.map(t => {
      const test = t.Test;  // The Test might be null
      return {
        idtema:        t.idtema,
        datatrimitere: t.datatrimitere,  // The date student received the assignment
        status:        t.status,  // The status of the assignment
        document:      test ? test.document : null,  // Test document (if available)
        barem:         test ? test.barem : null,  // Test barem (if available)
        rezolvare:     t.rezolvare  // The student's solution to the assignment
      };
    });

    res.status(200).json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Eroare la obținerea temelor elevului.' });
  }
};
