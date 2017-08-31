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
    var curr_user = {
        name:req.user.username,
    }
    res.render("blogs.ejs",curr_user);
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


app.listen(3000);