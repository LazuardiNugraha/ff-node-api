const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    DataTypes: STRING,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    DataTypes: STRING(100),
  },
}, {
  timestamps: true,
});

module.exports = User;
// This file defines the User model using Sequelize. It specifies the attributes of the User table and their data types.