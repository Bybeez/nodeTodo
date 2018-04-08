const users = require('../models/users')

class userController {
   static newUser(req, res) {
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
   }

   static login(req, res) {
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
   }



module.exports = userController
