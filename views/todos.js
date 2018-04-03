const Sequelize = require('sequelize')
const db = require('../db')
const ToDos = db.define('todos', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  description: {
    type: Sequelize.STRING
  },
  status: {
    type: Sequelize.BOOLEAN
  }
})

module.exports = ToDos
