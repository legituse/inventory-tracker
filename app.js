require('dotenv').config()

const mysql = require('mysql');
const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');

const app = express()

//Configuring express server
app.use(bodyparser.json());

let mysqlConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    multipleStatements: true
});

mysqlConnection.connect((err)=> {
    if(!err)
        console.log('Connection Established Successfully');
    else
        console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
});

app.get('/', (req, res) => {
    res.redirect('/inventory.html');
})

app.get('/getInv', function (req, res) {
    mysqlConnection.query('SELECT * FROM items',(err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    });
});

app.get('/updateInv', function (req, res){
    if (!isNaN(req.query.id) && !isNaN(req.query.quantity) && req.query.quantity > -1){
        mysqlConnection.query('update `items` set `item_quantity` = ? where `item_id` = ?', [req.query.quantity, req.query.id], function (error, results, fields) {
            if (!error)
                res.send(results);
            else
                console.log(error);
        });
    }
});

app.get('/deleteItem', function (req, res) {
    if (!isNaN(req.query.id)){
        mysqlConnection.query('DELETE FROM items WHERE item_id = ?;', [req.query.id], function (error, results, fields) {
            if (!error)
                res.send(results);
            else
                console.log(error);
        });
    }
});

app.get('/createItem', function (req, res){
    let reqArr = req.query.tags.split(',')
    if (req.query.name.length > 3 && !isNaN(req.query.quantity) && req.query.quantity > -1 && reqArr.length > 0){
        mysqlConnection.query('INSERT INTO items (item_name, item_quantity, item_tags) values (?,?,?)', [req.query.name,req.query.quantity,JSON.stringify(reqArr)], function (error, results, fields) {
            if (!error)
                res.send(results);
            else
                console.log(error);
        });
    }
});

app.use(express.static(path.join(__dirname, '/src')));

var server = app.listen(process.env.PORT || 13000, () => {
    console.log('Listening on port ' + server.address().port);
});
