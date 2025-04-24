const { Sequelize, DataTypes } = require("sequelize");
require('dotenv').config()


const sequelize = new Sequelize(`postgres://${process.env.PG_USER}:${process.env.PG_PASS}@localhost:5433/${process.env.PG_DB}`, {
    dialect: 'postgres',
  });

const Profesori = require("./profesori")(sequelize, DataTypes);
const Elevi = require("./elevi")(sequelize, DataTypes);
const Exercitii = require("./exercitii")(sequelize, DataTypes);
const Capitole = require("./capitole")(sequelize, DataTypes);
const Subcapitole = require("./subcapitole")(sequelize, DataTypes);
const Teste = require("./teste")(sequelize, DataTypes);
const AsociereEt = require("./asociere_et")(sequelize, DataTypes);
const Teme = require("./teme")(sequelize, DataTypes);

Exercitii.belongsTo(Capitole, { foreignKey: 'capitol', as: 'capitolInfo' });
Exercitii.belongsTo(Subcapitole, { foreignKey: 'subcapitol', as: 'subcapitolInfo' });
Subcapitole.belongsTo(Capitole, { foreignKey: 'idcapitol', as: 'capitolInfo' });
Teste.belongsTo(Profesori, { foreignKey: 'idprofesor', as: 'ProfesorInfo' });
AsociereEt.belongsTo(Teste, { foreignKey: 'idtest', as: 'Test' });
AsociereEt.belongsTo(Exercitii, { foreignKey: 'idexercitiu', as: 'Exercitiu' });
Elevi.belongsTo(Profesori, { foreignKey: 'idprof', as: 'Profesor' });
Teme.belongsTo(Elevi, {foreignKey:'idelev', as: 'Elev'});
Teme.belongsTo(Teste, {foreignKey:'idtest', as: 'Test'});

module.exports = {
  sequelize,
  Profesori,
  Elevi,
  Exercitii,
  Capitole,
  Subcapitole,
  Teste,
  AsociereEt,
  Teme,
};
