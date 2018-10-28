var express = require('express')
var app = express()
var expressValidator = require('express-validator')
var path = require('path')
var busboy = require('then-busboy')
var fileUpload = require('express-fileupload')
var mysql = require('mysql')
var exp = require('exports')
var fs = require('fs');

/**
 * This middleware provides a consistent API
 * for MySQL connections during request/response life cycle
 */
var myConnection  = require('express-myconnection')
/**
 * Store database credentials in a separate config.js file
 * Load the file/module and its values
 */
var config = require('./config')
var dbOptions = {
    host:      config.database.host,
    user:       config.database.user,
    password: config.database.password,
    port:       config.database.port,
    database: config.database.db
}

/**
 * 3 strategies can be used
 * single: Creates single database connection which is never closed.
 * pool: Creates pool of connections. Connection is auto release when response ends.
 * request: Creates new connection per new request. Connection is auto close when response ends.
 */
app.use(myConnection(mysql, dbOptions, 'pool'))

/**
 * setting up the templating view engine
 */
app.set('view engine', 'ejs')


/**
 * import routes/index.js
 * import routes/users.js
 */
var index = require('./routes/index')
var users = require('./routes/users')
var cl =require('./routes/class')
var cont =require('./routes/contents')
var board = require('./routes/board')
var fld=require('./routes/topic')
var strm=require('./routes/streams')
var sbj=require('./routes/subject')
var exm=require('./routes/exam')
var tcr=require('./routes/category')
var home=require('./routes/home')
var site=require('./routes/site')
var admin=require('./routes/admin')
var reg=require('./routes/registration')

// for front end
/*app.get('/', function(req, res){
    res.render('index',{user:"John Smith"})
  }); */
app.use(fileUpload());
/**
 * Express Validator Middleware for Form Validation
 */
app.use(expressValidator())


/**
 * body-parser module is used to read HTTP POST data
 * it's an express middleware that reads form's input
 * and store it as javascript object
 */
var bodyParser = require('body-parser')
/**
 * bodyParser.urlencoded() parses the text as URL encoded data
 * (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body.
 */
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


/**
 * This module let us use HTTP verbs such as PUT or DELETE
 * in places where they are not supported
 */
var methodOverride = require('method-override')

/**
 * using custom logic to override method
 *
 * there are other ways of overriding as well
 * like using header & using query value
 */
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

/**
 * This module shows flash messages
 * generally used to show success or error messages
 *
 * Flash messages are stored in session
 * So, we also have to install and use
 * cookie-parser & session modules
 */
var flash = require('express-flash')
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser('keyboard cat'))
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(flash())
app.use('/', index)
//app.use('/reb/users', users)
app.use('/admin/class',cl)
app.use('/admin/content',cont)
app.use('/admin/board',board)
app.use('/admin/topic',fld)
//app.use('/reb/streams',strm)
app.use('/admin/subject',sbj)
//app.use('/reb/exam',exm)
app.use('/admin/category',tcr)
//app.use('/reb/home',home)
app.use('/site',site)
app.use('/admin',admin)
app.use('/registration',reg)



app.use(express.static(path.join(__dirname, 'assets')));


app.use(express.static(path.join(__dirname, 'assets/uploads/pdf/')));


app.listen(3000, function(){
    console.log('Server running at port 3000: http://127.0.0.1:3000')
})
