const express = require('express')
const bodyParser = require('body-parser')
const todos = require('./models/todos')
const users = require('./models/users')
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

app.post('/newUser', (req, res) => {
   users.create(
      {pseudo : req.body.pseudo, password: bcrypt.hashSync(req.body.password, 1)}
   ).then(result => {
      if(req.header("Accept") == "application/json")
      {
         res.json({"status success":result})
      }
      else{
         res.redirect('/todos')
      }
   })
})

app.get('/login', (req, res) => {
   res.render('login')
})

app.post('/login', (req, res) => {
   users.findOne({where : {pseudo: req.body.pseudo }}).then(user => {
      if(bcrypt.compareSync(req.body.password, user.password))
      {
         req.session.userId = user.id
         if(req.header("Accept") == "application/json")
         {
            res.send(user)
         }
         else{
            res.redirect('/todos')
         }
      }
      res.redirect('/login')
   })
})

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

app.post('/todos', (req, res) => {
   ownsToDoOrRedirect(req, res, req.body.toDoId)
   var desc = req.body.description
   if(req.body._method == 'patch')
   {
      update(req, res)
   }
   else{
      if(desc)
      {
         todos.create(
            {description : desc, status: false, owner_id: req.session.userId}
         ).then(result => {
            if(req.header("Accept") == "application/json")
            {
               res.json({"status success":result})
            }
            else{
               res.redirect('/todos')
            }
         })
      }
   }
})

app.get('/todos', (req, res) => {
   todos.findAll({where : {owner_id: req.session.userId}}, order: [[status, 'asc']]).then(todos => {
      if(req.header("Accept") == "application/json")
      {
         res.send(todos)
      }
      else{
         res.render('index', {
            title: 'todos',
            todos: todos
         })
      }
  })
})

app.get('/todos/add', (req, res) => {
   if(req.header("Accept") != "application/json")
   {
      res.render('edit', {
         title: 'addTodo',
      })
   }
})

app.get('/todos/:toDoId/edit', (req, res) => {
   ownsToDoOrRedirect(req, res, req.params.toDoId)
   todos.findOne({where : {id: req.params.toDoId}}).then(todo => {
      if(req.header("Accept") != "application/json")
      {
         res.render('edit', {
            title: 'editTodo',
            todo: todo
         })
      }
   })
})

app.get('/todos/:toDoId/del', (req, res) => {
   ownsToDoOrRedirect(req, res, req.params.toDoId)
   todos.destroy({where : {id: req.params.toDoId}}).then(result => {
      res.redirect('/todos')
   })
})

app.get('/todos/:toDoId', (req, res) => {
   ownsToDoOrRedirect(req, res, req.params.toDoId)
   todos.findOne({where : {id: req.params.toDoId}}).then(todo => {
      if(req.header("Accept") == "application/json")
      {
         res.send(todos)
      }
      else{
         res.render('show', {
            title: 'todo : '+todo.id,
            todo: todo
         })
      }
   })
})

app.delete('/todos/:toDoId', (req, res) => {
   ownsToDoOrRedirect(req, res, req.body.toDoId)
   todos.destroy({where : {id: req.params.toDoId}}).then(result => {
      res.send((result == 1 ? 'Ok' : 'Not Ok'))
   })
})

app.patch('/todos/:toDoId', (req, res) => {
   ownsToDoOrRedirect(req, res, req.body.toDoId)
   update(req, res)
})



app.use((req, res) => {
   res.status(404).send('Not Found')
})

app.listen(PORT, () => {
   console.log("Listening on : ", PORT)
})

function update(req, res)
{
   todos.update(
      {
         description: req.body.description,
         status: (req.body.status)? true : false
      },
      { where: { id: req.body.id } }
   ).then(result => {
      if(req.header("Accept") == "application/json")
      {
       function auth(req, res)
{
   res.redirect('/login')
}  res.json({"status success": result})
      }
      else{
         res.redirect('/todos')
      }
   })
}

function ownsToDoOrRedirect(req, res, id)
{
   todos.findOne({where : {id: id}}).then(todo => {
      if(req.session.userId != todo.owner_id){
            res.redirect('/todos')
      }
   })
}
