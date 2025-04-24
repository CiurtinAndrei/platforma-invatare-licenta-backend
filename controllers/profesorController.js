const bcrypt = require("bcrypt")
const {Profesori, Elevi} = require("../models")
const { Teste, Teme } = require('../models');

exports.creeazaProfesor = async (req, res) =>{

    try{
        const { nume, prenume, adresa, email, telefon, scoala, parola } = req.body
        const emailExistent= await Profesori.findOne({where: {email}})
        const emailExistentLaElevi = await Elevi.findOne({where: {email}})
            if(emailExistent || emailExistentLaElevi){
                return res.status(400).json({error: "Un utilizator cu acest e-mail este deja înregistrat!"})
            }
        const telExistent= await Profesori.findOne({where: {telefon}})
        const telExistentLaElevi = await Elevi.findOne({where: {telefon}})
            if(telExistent || telExistentLaElevi){
                return res.status(400).json({error: "Un utilizator cu acest nr de telefon este deja înregistrat!"})
            }
        const hashedPassword = await bcrypt.hash(parola, 10)
        const newProf = await Profesori.create({
            nume,
            prenume,
            adresa,
            email,
            telefon,
            scoala,
            parola: hashedPassword,
        })

        res.status(201).json({message: "Profesor înregistrat cu succes!"})

    } catch(err){
        console.log(err)
        res.status(500).json({error: "Eroare la înregistrarea acestui profesor!"})
    }



}



exports.assignTema = async (req, res) => {
    try {
      const profesorId = req.user.id;               // from JWT
      const { idtest, idelev } = req.params;
  
      // 1) Verify test exists and belongs to this profesor
      const test = await Teste.findByPk(idtest);
      if (!test || test.idprofesor !== profesorId) {
        return res.status(404).json({ error: 'Test inexistent sau nepermis.' });
      }
  
      // 2) Create the tema
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      await Teme.create({
        idelev,
        idtest,
        datatrimitere: today,
        status: 'Trimis',
        // datacorectare, nota, raportprofesor, feedback  remain NULL
      });
  
      return res.status(201).json({ message: 'Temă trimisă cu succes.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Eroare la trimiterea temei.' });
    }
  };



  exports.getAssignments = async (req, res) => {
    try {
      const profesorId = req.user.id;
  
      // LEFT JOIN on Test so we still get Teme rows even if Test is null
      const assignments = await Teme.findAll({
        include: [
          {
            model: Elevi,
            as: 'Elev',
            attributes: ['nume', 'prenume'],
            where: { idprof: profesorId }
          },
          {
            model: Teste,
            as: 'Test',
            required: false,              // ← allow Test to be null
            attributes: ['titlu', 'document', 'barem']
          }
        ],
        attributes: ['idtema', 'datatrimitere', 'status', 'rezolvare']
      });
  
      const payload = assignments.map(a => {
        const test = a.Test;  // may be null
        return {
          idtema:        a.idtema,
          fullName:      `${a.Elev.nume} ${a.Elev.prenume}`,
          datatrimitere: a.datatrimitere,
          status:        a.status,
          document:      test ? test.document : null,
          barem:         test ? test.barem    : null,
          rezolvare:     a.rezolvare,
          numetest:      test ? test.titlu    : null
        };
      });
  
      res.status(200).json(payload);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Eroare la obținerea assignment-urilor.' });
    }
  };


  exports.deleteAssignment = async (req, res) => {
    try {
      const { idtema } = req.params;
      const deleted = await Teme.destroy({ where: { idtema } });
      if (!deleted) {
        return res.status(404).json({ error: 'Assignment inexistent.' });
      }
      res.status(200).json({ message: 'Assignment șters cu succes.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Eroare la ștergerea assignment-ului.' });
    }
  };