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


var custom_passport = require('./config/passport.js');
custom_passport(passport);


/////////////////////////////////GET REQUESTS////////////////////////////////
app.get('/login',function(req,res){
    res.sendFile(path.join(__dirname+"/view/login.html"));
});

app.get('/profile',function(req,res){
    res.end('LoggedIn '+req.user.username);
});


////////////////////////////////POST REQUESTS////////////////////////////////
app.post('/login',passport.authenticate('local-login',{
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash : true
})
);

app.post('/signup',passport.authenticate('local-signup',{
   successRedirect : '/profile',
   failureRedirect : '/login',
   failureFlash : true 
})
);


app.listen(3000);