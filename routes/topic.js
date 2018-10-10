var express = require('express')
var app = express()

 
// SHOW LIST OF classes
app.get('/topic-list', function(req, res, next) {
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM tbl_boards ORDER BY id DESC',function(err, rows, fields) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                res.render('admin/topic/topic-list', {
                    title: 'Topic List', 
                    data: ''
                })
            } else {
                // render to views/user/list.ejs template file
                res.render('admin/topic/topic-list', {
                    title: 'Topic List', 
                    data: rows
                })
            }
        })
    })
})
 
// SHOW ADD Class FORM
app.get('/addtopic', function(req, res, next){
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM tbl_boards ORDER BY id DESC',function(err, rows, fields) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                res.render('admin/topic/addtopic', {
                    title: 'Add Topic',
                    data:''
                })
            } else {
              res.render('admin/topic/addtopic', {
                  title: 'Add Subject',
                  data:rows
              })
            }
        })
    })
  
  })

  app.get('/show_topic', function(req, res, next) {
    req.getConnection(function(error, conn) {
      var query = 'SELECT * FROM tbl_topic where subject_id = '+req.query.id;
        conn.query(query,function(err, rows, fields) {
          res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(rows));
        })
    })
})








 
// ADD NEW Content POST ACTION
app.post('/addtopic', function(req, res, next){    
    req.assert('subject_id', 'Field Name is required').notEmpty() 
    req.assert('topic_name', 'Topic Name is required').notEmpty()  
    req.assert('text_name', 'Description is required').notEmpty()   

    var errors = req.validationErrors()
    
    if( !errors ) {  
        var fld = {
            topic_name: req.sanitize('topic_name').escape().trim(),
            description: req.sanitize('text_name').escape().trim(),
            subject_id: req.sanitize('subject_id').escape().trim(),
            class_id:  req.sanitize('class_id').escape().trim(),
            
        }
        
        req.getConnection(function(error, conn) {
            conn.query('INSERT INTO tbl_topic SET ?', fld, function(err, result) {
               
                if (err) {
                    req.flash('error', err)
                    res.redirect('/topic')
                        
                } else {                
                    req.flash('success', 'Topic added successfully!')
                    res.redirect('/admin/topic/addtopic')
                        
                }
            })
        })
    }
    else {   
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        res.redirect('/admin/topic/addtopic')
    }
})
 
// SHOW EDIT USER FORM
app.get('/editfield/(:id)', function(req, res, next){
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM fields WHERE id = ' + req.params.id, function(err, rows, fields) {
            if(err) throw err
            
            // if class not found
            if (rows.length <= 0) {
                req.flash('error', 'Field not found with id = ' + req.params.id)
                res.redirect('/fields')
            }
            else { // if class found
                // render to views/classes/editclass.ejs template file
                res.render('field/editfield', {
                    title: 'Edit Field', 
                    //data: rows[0],
                    id: rows[0].id,
                    field_name: rows[0].field_name,
                    })
            }            
        })
    })
})
 
// EDIT classes POST ACTION
app.put('/editfield/:id', function(req, res, next) {
    req.assert('field_name', 'Field Name is required').notEmpty()           //Validate name
    
    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
        
        /********************************************
         * Express-validator module
         
        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';
 
        req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
        var fld = {
            field_name: req.sanitize('field_name').escape().trim(),
            }
        
        req.getConnection(function(error, conn) {
            console.log(req.params);

            conn.query('UPDATE fields SET ? WHERE id = ' + req.params.id, fld, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/user/add.ejs
                    res.render('field/editfield', {
                        title: 'Edit Field',
                        field_name: req.body.field_name,
                        })
                } else {
                    req.flash('success', 'Data updated successfully!')
                    
                    conn.query('SELECT * FROM fields ORDER BY id DESC',function(err, rows, fields) {
                        //if(err) throw err
                        if (err) {
                            req.flash('error', err)
                            res.render('field/fieldlist', {
                                title: 'Field List', 
                                data: ''
                            })
                        } else {
                            // render to views/user/list.ejs template file
                            res.render('field/fieldlist', {
                                title: 'Field List', 
                                data: rows
                            })
                        }
                    })
                }
            })
        })
    }
    else {   //Display errors to user
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        
        /**
         * Using req.body.name 
         * because req.param('name') is deprecated
         */ 
        res.render('field/editfield', { 
            title: 'Edit Field',            
            
            field_name: req.body.field_name,
            })
    }
})
 
// DELETE Class
app.get('/delete', function(req, res, next) {
    var sbj = { id: req.params.id }

    req.getConnection(function(error, conn) {
        conn.query('DELETE FROM tbl_topic WHERE id = ' + req.query.id, sbj, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                res.writeHead(200, {'Content-Type': 'application/json'});
                var obj = {succes : 0 , message : err}
                  res.end(JSON.stringify(obj));
            } else {
                req.flash('success', 'User deleted successfully! id = ' + req.params.id)
                res.writeHead(200, {'Content-Type': 'application/json'});
                var obj = {success : 1 , message : 'Topic Deleted successfully'}
                  res.end(JSON.stringify(obj));
            }
        })
    })
})
 
module.exports = app