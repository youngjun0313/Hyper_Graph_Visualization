const express = require('express');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hypergraph_prev',
    ssl: true
});

const app = express();

app.set('port', 7777);

app.listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
  });

app.get('/', (req, res) => {
  res.send('Root');
});

app.get('/users', (req, res) => {
  connection.query('SELECT * from noun', (error, rows) => {
    if (error) throw error;
    console.log('noun info is: ', rows);
    res.send(rows);
  });
});