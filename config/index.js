/**
 * http://usejsdoc.org/
 */
var configValues = require('./config');

module.exports = {
    
    getDbConnectionString: function() {
        return 'mongodb://'+configValues.uname+':'+configValues.pwd+'@ds115866.mlab.com:15866/brixtrial';
    }
    
};