/**
 * http://usejsdoc.org/
 */
var Todos = require('../models/todoModel');

module.exports = function(app) {
    
   app.get('/api/setupTodos', function(req, res) {
       
       // seed database
       var starterTodos = [
           {
               name:'Brix Secretaria',
               address:'Consolacion',
               school:'Eh di sa puso mo'
           },
           {
        	   name:'Nico Enriquez',
               address:'Mandaue City',
               school:'Mandaue Central School'
           },
           {
        	   name:'Cecille Ho',
               address:'Davao City',
               school:'Penaplata Elementary School'
           }
       ];
       Todos.create(starterTodos, function(err, results) {
           res.send(results);
       }); 
   });
    
} 
