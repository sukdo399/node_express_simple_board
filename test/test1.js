// test1.js
var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : 100,
  host            : '127.0.0.1',
  user            : 'root',
  password        : '',
  database        : 'test'
});

pool.query('SELECT 1 + 1 AS solution', function(err, rows) {
  if (err) throw err;
  console.log(rows);
  console.log('rows[0].solution=', rows[0].solution);
});
