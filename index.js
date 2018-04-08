const express = require('express')
const bodyParser = require('body-parser')
const todo = require('./controllers/todos')
const users = require('./controllers/users')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const app = express()
const PORT = process.env.PORT || 8080

app.use(bodyParser.json())
app.use(cookieParser('CH0C0L4T1N3'));
app.use(session());

app.set('views', './views')
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({
   extended: true
}))

app.get('/users/create', (req, res) => {
   res.render('newUser')
})

app.post('/newUser', users.newUser(req, res))

app.get('/login', (req, res) => {
   res.render('login')
})

app.post('/login', users.login(req, res))

app.use((req, res, next) => {
   if(req.session.userId)
   {
      next()
   }
   else
   {
      res.redirect('/login')
   }
})

app.all('/', (req, res) => {
   res.redirect('/todos')
})

app.post('/todos', todo.newToDo(req, res))

app.get('/todos', todo.allToDos(req, res))

app.get('/todos/add', (req, res) => {
   if(req.header("Accept") != "application/json")
   {
      res.render('edit', {
         title: 'addTodo',
      })
   }
})

app.get('/todos/:toDoId/edit', todo.editToDo(req, res))

app.get('/todos/:toDoId/del', todo.deleteToDo(req, res))

app.get('/todos/:toDoId', todo.oneToDo(req, res))

app.delete('/todos/:toDoId', todo.deleteToDo(req, res))

app.patch('/todos/:toDoId', todo.update(req, res))



app.use((req, res) => {
   res.status(404).send('Not Found')
})

app.listen(PORT, () => {
   console.log("Listening on : ", PORT)
})

function auth(req, res)
{
   res.redirect('/login')
}
