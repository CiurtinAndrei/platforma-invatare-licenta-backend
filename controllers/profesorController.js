const bcrypt = require("bcrypt")
const {Profesori} = require("../models")

exports.creeazaProfesor = async (req, res) =>{

    try{
        const { nume, prenume, adresa, email, telefon, scoala, parola } = req.body
        const emailExistent= await Profesori.findOne({where: {email}})
            if(emailExistent){
                return res.status(400).json({error: "Un profesor cu acest e-mail este deja înregistrat!"})
            }
        const telExistent= await Profesori.findOne({where: {telefon}})
            if(telExistent){
                return res.status(400).json({error: "Un profesor cu acest nr de telefon este deja înregistrat!"})
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