/**
 * http://usejsdoc.org/
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var todoSchema = new Schema({
	name: String,
	address: String,
	school: String
});

var Todos = mongoose.model('Todos', todoSchema);

module.exports = Todos;