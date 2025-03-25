const { Sequelize, DataTypes } = require("sequelize");
require('dotenv').config()


const sequelize = new Sequelize(`postgres://${process.env.PG_USER}:${process.env.PG_PASS}@localhost:5433/${process.env.PG_DB}`, {
    dialect: 'postgres',
  });

const Profesori = require("./profesori")(sequelize, DataTypes);
const Elevi = require("./elevi")(sequelize, DataTypes);
const Exercitii = require("./exercitii")(sequelize, DataTypes);

module.exports = {
  sequelize,
  Profesori,
  Elevi,
  Exercitii,
};
