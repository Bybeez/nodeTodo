const todos = require('../models/todos')

class toDoController {
   static newToDo(req, res) {
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
   }

   static allToDos(req, res) {
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
   }

   static oneToDo(req, res) {
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
   }

   static deleteToDo(req, res) {
      ownsToDoOrRedirect(req, res, req.params.toDoId)
      todos.destroy({where : {id: req.params.toDoId}}).then(result => {
         if(req.header("Accept") == "application/json")
         {
            res.send((result == 1 ? 'Ok' : 'Not Ok'))
         }
         else {
            res.redirect('/todos')
         }
      })
   }

   static update(req, res)
   {
      ownsToDoOrRedirect(req, res, req.body.toDoId)
      todos.update(
         {
            description: req.body.description,
            status: (req.body.status)? true : false
         },
         { where: { id: req.body.id } }
      ).then(result => {
         if(req.header("Accept") == "application/json")
         {
            res.json({"status success": result})
         }
         else{
            res.redirect('/todos')
         }
      })
   }

   static editToDo(req, res){
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
   }

   static ownsToDoOrRedirect(req, res, id)
   {
      todos.findOne({where : {id: id}}).then(todo => {
         if(req.session.userId != todo.owner_id){
            res.redirect('/todos')
         }
      })
   }
}
