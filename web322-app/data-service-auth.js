const bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});

let User; // to be defined on new connection (see initialize) 

var connectionString = "mongodb://mphuong:292u3io78fk@ds053944.mlab.com:53944/web322_a6"

module.exports.initialize = () =>{
    return new Promise((resolve, reject) =>{
        let db = mongoose.createConnection(connectionString);

        db.on('error', (err)=>{ 
            reject(err); // reject the promise with the provided error 
        }); 
        db.once('open', ()=>{ 
            User = db.model("users", userSchema);
            resolve();
        }); 
    });
};


module.exports.registerUser = (userData) =>{
    return new Promise((resolve,reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match.");
        } else {
            bcrypt.genSalt(10, function(err, salt) { // Generate a "salt" using 10 rounds
                if (err) {
                    reject("There was an error encrypting the password");
                } else {
                    bcrypt.hash(userData.password, salt, function(err, hash) { // encrypt password
                    // TODO: Store the resulting "hash" value in the DB
                        if (err) {
                            reject("There was an error encrypting the password");
                        } else {
                            //create new user and save
                            let newUser = new User(userData);
                            newUser.password = hash;

                            newUser.save((err) =>{ 
                                if(err) {
                                    if(err.code == 11000) {
                                        reject("User Name already taken");
                                    }
                                    reject("There was an error creating the user: " + err);
                                } else {
                                    resolve();
                                }
                            });
                        } 
                    });
                }
            });
        }
    });
};

module.exports.checkUser = (userData) =>{
    return new Promise( (resolve, reject) => {
        User.find({ userName: userData.userName })  
        .exec()
        .then((user) =>{
            if(user.length == 0) { 
                reject("Unable to find user:" + userData.user);
            }
            hash = user[0].password;

            //compare passwords
            bcrypt.compare(userData.password, hash).then((res) => {    
                // res === true if it matches and res === false if it does not match 
                if(res === true){
                    user[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent}); 
                    User.update(
                        {userName: user[0].userName}, 
                        {$set: {loginHistory: user[0].loginHistory}},
                        { multi: false }
                    )
                    .exec()
                    .then(()=>{
                        resolve(user[0]); 
                    })
                    .catch((err) =>{
                        reject( "There was an error verifying the user: " + err);
                    });
                } else {
                    reject("Incorrect Password for user: " +  userData.userName);
                }
            });        
        })
        .catch((err) => {
            reject("Unable to find user:" + userData.userName); 
        });
    });
};