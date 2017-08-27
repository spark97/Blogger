var mysql = require('mysql');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;


connection.query('USE ' + dbconfig.database);

module.exports = function(passport){

    passport.serializeUser(function(user,done){
        done(null,user.id);
    });

    passport.deserializeUser(function(id,done){
        connection.query("select * from users where id=?",[id],function(err,rows){
            done(err,rows[0]);
        });
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField       : 'username',
            passwordField       : 'password',
            passReqToCallback   : true
        },
        function(req,username,password,done){
            connection.query("select * from users where username =? ",[username],function(err,rows){
                if(err){
                    return done(err);
                }
                if(rows.length){
                    return done(null,false,req.flash('signupMessage','Username Taken'));
                }
                else
                {
                    var newUser = {
                        username: username,
                        password: password// bcrypt.hashSync(password,null,null)
                    };
                    var insertQuery = "insert into users (username,password) values (?,?)";
                    connection.query(insertQuery,[newUser.username,newUser.password],function(err,rows){
                        newUser.id = rows.insertId;
                        return done(null,newUser);
                    });
                }
            });
        })
    );



passport.use(
    'local-login',
    new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req,username,password,done){
        connection.query("select * from users where username = ?",[username],function(err,rows){
            if(err)
                return done(err);
            if(!rows.length){
                return done(null,false,req.flash('loginMessage','No user found'));
            }
            if(password!=rows[0].password)
                return done(null,false,req.flash('loginMessage','Incorrect Password'));
            
            return done(null,rows[0]);
        });
    })
);


};