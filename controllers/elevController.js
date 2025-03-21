const bcrypt = require("bcrypt");
const {Profesori, Elevi} = require("../models")

exports.creeazaElev = async (req, res) => {
  try {
    const { nume, prenume, adresa, email, telefon, scoala, parola, clasa } = req.body;

    const emailExistent = await Elevi.findOne({ where: { email } });
    const emailExistentLaProfesori = await Profesori.findOne({where: {email}})
    if (emailExistent || emailExistentLaProfesori) {
      return res.status(400).json({ error: "Un utilizator cu acest e-mail este deja înregistrat!" });
    }

    const telExistent = await Elevi.findOne({ where: { telefon } });
    const telExistentLaProfesori = await Profesori.findOne({where: {telefon}})
    if (telExistent || telExistentLaProfesori) {
      return res.status(400).json({ error: "Un utilizator cu acest nr de telefon este deja înregistrat!" });
    }

    const hashedPassword = await bcrypt.hash(parola, 10);

    const newElev = await Elevi.create({
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
