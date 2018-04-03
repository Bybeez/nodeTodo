const Sequelize = require('sequelize')
const db = require('../db')
const Users = db.define('users', {
   id: {
      type: Sequelize.STRING,
      primaryKey: true
   },
   pseudo: {
      type: Sequelize.STRING
   },
   password: {
      type: Sequelize.STRING
   }
})

module.exports = Users
