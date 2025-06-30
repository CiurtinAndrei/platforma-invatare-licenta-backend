const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const bcrypt = require("bcrypt");
const { Profesori, Elevi } = require("../models");
const { Teme, Teste } = require("../models");

const SOLUTIONS_BASE_URL = "http://localhost:8000/rezolvari";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "el_subm");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const randomPart = crypto.randomBytes(6).toString("hex");       
    const filename = `rez_doc_${Date.now()}_${randomPart}.pdf`;
    cb(null, filename);
  }
});

const upload = multer({ storage });


exports.uploadRezolvare = [
  upload.single("file"),
  async (req, res) => {
    try {
      const { idtema } = req.params;
      if (!req.file) {
        return res.status(400).json({ error: "Niciun fișier PDF încărcat." });
      }

      const tema = await Teme.findByPk(idtema);
      if (!tema) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: "Tema nu a fost găsită." });
      }

      if (tema.rezolvare) {
        const oldFilename = path.basename(tema.rezolvare);
        const oldPath = path.join(__dirname, "..", "el_subm", oldFilename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const publicUrl = `${SOLUTIONS_BASE_URL}/${req.file.filename}`;
      tema.rezolvare = publicUrl;
      tema.status = "În curs de corectare";
      await tema.save();

      return res.status(200).json({
        message: "Rezolvare încărcată cu succes.",
        rezolvare: publicUrl
      });
    } catch (err) {
      console.error("Eroare la încărcarea rezolvării:", err);
      return res.status(500).json({ error: "Eroare internă la upload." });
    }
  }
];



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
    const profesorId = req.user.id;    
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
    const profesorId = req.user.id;     
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
          as: 'Test',  
          required: false,
          attributes: ['titlu', 'document', 'barem']
        }
      ],
      where: { idelev: elevId },  
      attributes: ['idtema', 'datatrimitere', 'status', 'rezolvare', 'nota', 'feedback'],  
      order:[['idtema', 'ASC']]
    });

    const payload = teme.map(t => {
      const test = t.Test;  
      return {
        idtema:        t.idtema,
        datatrimitere: t.datatrimitere,
        status:        t.status, 
        titlu:         test ? test.titlu: null,
        document:      test ? test.document : null, 
        barem:         test ? test.barem : null, 
        rezolvare:     t.rezolvare,  
        nota:          t.nota,
        feedback:      t.feedback
      };
    });

    res.status(200).json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Eroare la obținerea temelor elevului.' });
  }
};
