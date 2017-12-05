/**
 * http://usejsdoc.org/
 */
var Todos = require('../models/todoModel');
var bodyParser = require('body-parser');

module.exports = function(app) {
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    app.get('/api/all', function(req, res) {
        
        Todos.find({}, function(err, todos) {
            if (err) throw err;
            
            res.send(todos);
        });
        
    });
    
    app.get('/api/todos/:name', function(req, res) {
        
        Todos.find({ name: req.params.name }, function(err, todos) {
            if (err) throw err;
            
            res.send(todos);
        });
        
    });
    
    app.get('/api/todo/:id', function(req, res) {
       
       Todos.findById({ _id: req.params.id }, function(err, todo) {
           if (err) throw err;
           
           res.send(todo);
       });
        
    });
    
    app.post('/api/todo', function(req, res) {
        
        if (req.body.id) {
            Todos.findByIdAndUpdate(req.body.id, { todo: req.body.name, address: req.body.address, school: req.body.school }, function(err, todo) {
                if (err) throw err;
                
                res.send('Success');
            });
        }
        
        else {
           
           var newTodo = Todos({
               name: req.body.name,
               address: req.body.address,
               school: req.body.school
           });
           newTodo.save(function(err) {
               if (err) throw err;
               res.send('Success');
           });
            
        }
        
    });
    
    app.delete('/api/todo', function(req, res) {
        
        Todos.findByIdAndRemove(req.body.id, function(err) {
            if (err) throw err;
            res.send('Success');
        })
        
    });
    
}