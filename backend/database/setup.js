const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: "./database/storage/data.db"
});

module.exports = {
    sequelize
}
