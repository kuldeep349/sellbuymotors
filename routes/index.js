
var express = require('express')
var app = express()

const {database} = require('../db.js')
app.get('/',async function(req, res, next) {
        res.render('site/index', {
            title: 'Add content',
            data: []
        }) 
})
app.get('/search-cars',async function(req, res, next) {
        res.render('site/search_cars', {
            title: 'Search Cars',
            data: []
        }) 
})


app.get('/class-wise',async function(req, res, next) {
    var topic
    var subject
    var current_subs = req.query.id;
    var query = 'SELECT * FROM tbl_topic where class_id = '+req.query.id;
    topic = await database.query(query, [] );
    var query = 'SELECT * FROM tbl_class GROUP BY class_name ORDER BY id ASC';
    subject = await database.query(query, [] );
    var data  = {
        subject: JSON.parse(subject),
        topic : JSON.parse(topic),
        current_subs : current_subs
    }
    res.render('site/class-wise', {
        title: 'Class List',
        data: data
    })
})
module.exports = app;
