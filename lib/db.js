const mysql = require("mysql");
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'nodejs',
    password : 'ch1356@f',
    port     : '3306',
    database : 'opentutorials'
})
db.connect(); //실제 접속이 일어나는 곳
module.exports = db;