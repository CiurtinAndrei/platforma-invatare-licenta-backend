const bcrypt = require("bcrypt")
const axios = require('axios');
const fs = require("fs");
const path = require("path");
const {
  Profesori,
  Elevi,
  Teste,
  Teme,
  AsociereEt,
  Exercitii,
  Capitole,
  Subcapitole
} = require('../models');

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
      const profesorId = req.user.id;            
      const { idtest, idelev } = req.params;
  
      const test = await Teste.findByPk(idtest);
      if (!test || test.idprofesor !== profesorId) {
        return res.status(404).json({ error: 'Test inexistent sau nepermis.' });
      }
  
      const today = new Date().toISOString().slice(0, 10); 
      await Teme.create({
        idelev,
        idtest,
        datatrimitere: today,
        status: 'Trimis',
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
            required: false,             
            attributes: ['titlu', 'document', 'barem']
          }
        ],
        attributes: ['idtema', 'datatrimitere', 'status', 'rezolvare', 'raportprofesor'],
        order:[['idtema', 'ASC']]
      });
  
      const payload = assignments.map(a => {
        const test = a.Test; 
        return {
          idtema:        a.idtema,
          fullName:      `${a.Elev.nume} ${a.Elev.prenume}`,
          datatrimitere: a.datatrimitere,
          status:        a.status,
          document:      test ? test.document : null,
          barem:         test ? test.barem    : null,
          rezolvare:     a.rezolvare,
          numetest:      test ? test.titlu    : null,
          raport:        a.raportprofesor,  
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
  
      const tema = await Teme.findByPk(idtema);
      if (!tema) {
        return res.status(404).json({ error: "Assignment inexistent." });
      }
  
      if (tema.rezolvare) {
        const filename = path.basename(tema.rezolvare);
        const filePath = path.join(__dirname, "..", "el_subm", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
  
      await Teme.destroy({ where: { idtema } });
  
      res.status(200).json({ message: "Assignment șters cu succes." });
    } catch (err) {
      console.error("Eroare la ștergerea assignment-ului:", err);
      res.status(500).json({ error: "Eroare la ștergerea assignment-ului." });
    }
  };


  exports.corecteazaTema = async (req, res) => {
    try {
      const profesorId = req.user.id;
      const { idtema } = req.params;
      const { scores } = req.body;
  
      const tema = await Teme.findByPk(idtema);
      if (!tema) return res.status(404).json({ error: 'Tema inexistentă.' });
      const test = await Teste.findByPk(tema.idtest);
      if (!test || test.idprofesor !== profesorId) {
        return res.status(403).json({ error: 'Nu aveți permisiunea de a corecta această temă.' });
      }
  
      const entries = await AsociereEt.findAll({
        where: { idtest: tema.idtest },
        include: [
          {
            model: Exercitii,
            as: 'Exercitiu',
            include: [
              { model: Capitole, as: 'capitolInfo' },
              { model: Subcapitole, as: 'subcapitolInfo' }
            ]
          }
        ],
        order: [['idasociere', 'ASC']]
      });
      if (entries.length !== scores.length) {
        return res.status(400).json({ error: 'Numărul de scoruri nu corespunde exercițiilor.' });
      }
  
      let total = 0;
      for (let i = 0; i < entries.length; i++) {
        const pts = parseInt(scores[i], 10);
        await entries[i].update({ punctaj: pts });
        total += pts;
      }

      total = total + 10
      total = total / 10

      await tema.update()
  
      const student = await Elevi.findByPk(tema.idelev);
      const report = {
        assignment_id: tema.idtema,
        student_name: `${student.nume} ${student.prenume}`,
        total_score: total,
        exercises: entries.map((e, idx) => ({
          number: idx + 1,
          chapter: e.Exercitiu.capitolInfo.nume,
          subchapter: e.Exercitiu.subcapitolInfo.nume,
          punctaj: e.punctaj
        }))
      };
  
      await tema.update({ raportprofesor: JSON.stringify(report) });
  
      const pyRes = await axios.post(
        'http://localhost:8001/process-report',
        report
      );
      const { feedback } = pyRes.data;
      const feedback_text = pyRes.data.feedback
      console.log(feedback_text)

      await tema.update({
        datacorectare: new Date(),
        status: 'Corectat',
        nota: total,
        feedback: feedback_text
      });
  
      return res.status(200).json({
        message: 'Corectare salvată și feedback generat.',
        feedback
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Eroare la corectarea temei.' });
    }
  };



  exports.getDateistorice = async (req, res) => {
    try {
      const idProfesor = req.user.id;           
      const prof = await Profesori.findByPk(idProfesor);
      if (!prof) return res.status(404).json({ error: 'Profesorul nu a fost gasit' });
  
  
      const payload = prof.dateistorice || { subject_data: [], n_clusters: 2 };
      res.json(payload);
    } catch (err) {
      console.error('Eroare la obtinerea datelor istorice:', err);
      res.status(500).json({ error: 'Eroare de server' });
    }
  };
  
  exports.saveDateistorice = async (req, res) => {
    try {
      const idProfesor = req.user.id;
      const { dateistorice } = req.body;
  
      const prof = await Profesori.findByPk(idProfesor);
      if (!prof) return res.status(404).json({ error: 'Profesorul nu a fost gasit' });
  
      await prof.update({ dateistorice });
      res.json({ message: 'Date istorice salvate' });
    } catch (err) {
      console.error('A aparut o eroare la salvarea datelor istorice:', err);
      res.status(500).json({ error: 'Eroare de server' });
    }
  };
  
  exports.clusterDateistorice = async (req, res) => {
    try {
      const idProfesor = req.user.id;
      const prof = await Profesori.findByPk(idProfesor);
      if (!prof) return res.status(404).json({ error: 'Profesorul nu a fost gasit' });
  
      const dateistorice = prof.dateistorice;
      if (!dateistorice?.subject_data?.length) {
        return res.status(400).json({ error: 'Nu exista date istorice' });
      }
  
      const pyRes = await axios.post(
        'http://0.0.0.0:8001/cluster-subjects',
        dateistorice
      );
  
      res.json(pyRes.data);
    } catch (err) {
      console.error('Eroare in procesul de clusterizare:', err);
      res.status(500).json({ error: 'Eroare de server' });
    }
  };