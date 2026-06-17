const { DataTypes, Sequelize } = require("sequelize");

const userModel = {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    username: {type: DataTypes.STRING, allowNull: false, unique: true},
    password: {type: DataTypes.STRING, allowNull: false}
}

/**
 * @param {Sequelize}
*/
module.exports = (sequelize) => sequelize.define('user', userModel);
