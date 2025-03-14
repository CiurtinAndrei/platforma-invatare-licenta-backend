const express = require('express')
const {Sequelize} = require('sequelize')
const cors = require("cors");
require('dotenv').config()

const app = express()


const port = 8000

const USER = process.env.PG_USER
const PASS = process.env.PG_PASS
const DB = process.env.PG_DB

const profesorRoutes = require("./routes/profesorRoutes")
const elevRoutes = require("./routes/elevRoutes")

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const sequelize = new Sequelize(`postgres://${USER}:${PASS}@localhost:5433/${DB}`, {
    dialect: 'postgres'
  })



app.get('/', (req, res)=>{
    res.send('Bine ati venit pe serverul de dezvoltare!')
})

app.use("/api/profesori", profesorRoutes)

app.use("/api/elevi", elevRoutes)

app.listen(port, async(err)=>{

    if(err){
        console.log('Error when opening Express server: ' + err)
    }
    else{
        console.log('Server started successfully at http://localhost:' + port)

        try{
            await sequelize.authenticate()
            console.log('Successfully connected to PostgreSQL database!')
        } catch(err){
            console.log(err);
        }
    }



})