var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var app = express();
var port = 3000;
var session =  require('express-session');
var morgan = require('morgan');
var mysql = require('mysql');
var dbconfig = require('./config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);


app.use(express.static("./resources/js"));
app.use(express.static("./resources/stylesheets"));
app.use(express.static("./resources/images"));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.use(session({secret:'harshit_shah',
                        resave: true,
                        saveUninitialized: true
                    }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.set('view engine','ejs');

var custom_passport = require('./config/passport.js');
custom_passport(passport);


/////////////////////////////////GET REQUESTS////////////////////////////////
app.get('/',function(req,res,next){
    if(req.user){
        res.redirect('/blogs');
    }
    else{
        next();
    }
},
function(req,res)
{
    res.redirect('/login');
});



app.get('/login',function(req,res,next){
    if(req.user){
        res.redirect('/blogs');
    }
    else{
        next();
    }
}
,function(req,res){
    res.render("login.ejs");
});



app.get('/profile',function(req,res,next){
    if(!req.user){
        res.redirect('/login');
    }
    else
    {
        next();
    }
}
,function(req,res){
    res.end('LoggedIn '+req.user.password);
});



app.get('/logout',function(req,res){

    if(req.user){
        req.logout();
        res.redirect('/login');
    }
    else
    {
        res.redirect('/login');
    }
});


app.get('/blogs',function(req,res,next){
    if(!req.user){
        res.redirect('/login');
    }
    else{
        next();
    }
},
function(req,res){
    
    
    var blogs;
    connection.query("SELECT U.username, B.user_id,B.id,B.title,B.description FROM user U, blogs B where U.id=B.user_id ORDER BY B.id DESC",function(err,rows){
        if(err){
            console.log('-----------------Error-------------------');
            res.end("Database connection error");
        }
        else{
            console.log(rows);
            res.render("blogs.ejs",{
        name: req.user.username,
        blogs: rows
        });
        }
    });

    
});

app.get('/blogs/:id',function(req,res,next){
   
    if(!req.user){
        res.redirect('/login');
    }
    else{
        next();
    }
},
function(req,res){
    var id = req.params.id;
    console.log('Id '+id);
    connection.query("SELECT U.username, B.user_id,B.id,B.title,B.description FROM user U, blogs B where U.id=B.user_id and B.id = ? ORDER BY B.id DESC",[id],function(err,rows){
        if(err){
            res.end("Error connecting to Database");
        }
        else{
            console.log("result "+rows);
            res.render("blog_page.ejs",{
                name:req.user.username,
                details:rows
            });
        }
    });
});

////////////////////////////////POST REQUESTS////////////////////////////////
app.post('/login',passport.authenticate('local-login',{
    successRedirect : '/blogs',
    failureRedirect : '/login',
    failureFlash : true
})
);




app.post('/signup',passport.authenticate('local-signup',{
   successRedirect : '/blogs',
   failureRedirect : '/login',
   failureFlash : true 
})
);


app.post('/blogs',function(req,res,next){
    if(!req.user){
        res.redirect('/login');
    }
    else{
        next();
    }
},
function(req,res){

    var user_id = req.user.id;
    var title = req.body.title;
    var description = req.body.description;

    connection.query('INSERT INTO blogs (user_id,title,description) VALUES (?,?,?)',[user_id,title,description],function(err,rows){
        if(err){
            res.redirect("/blogs");
        }
        else{
            console.log(rows);
            res.redirect("/blogs");
        }
    });
});


app.listen(3000);