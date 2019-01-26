/*********************************************************************************
 * WEB322 – Assignment 06
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part
 * of this assignment has been copied manually or electronically from any other source  
 * (including 3rd party web sites) or distributed to other students.
 * 
 * Name: __Michael Phuong__ Student ID: ___113069173__ Date: August 10, 2018 
 * 
 * Online (Heroku) Link:  https://floating-escarpment-82703.herokuapp.com/ 
 * 
 ********************************************************************************/  

var dataServiceAuth = require("./data-service-auth.js");
var dataService = require("./data-service.js");  
var express = require('express');
var app = express();
var path = require("path");
var multer = require("multer");
var fs = require("fs");
const bodyParser = require("body-parser");
var exphbs = require('express-handlebars');
var clientSessions = require('client-sessions');

app.use(express.static('./public'));

//storage
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      // we write the filename as the current date down to the millisecond
      // in a large web service this would possibly cause a problem if two people
      // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
      // this is a simple example.
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

const upload = multer({ storage: storage });

var HTTP_PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.engine(".hbs", exphbs({
    extname: ".hbs",
    defaultLayout: 'main', 
    helpers: {
        navLink: function(url, options){     
            return '<li' +          
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +  
        '><a href="' + url + '">' + options.fn(this) + '</a></li>'; },
        
        equal: function (lvalue, rvalue, options) {     
            if (arguments.length < 3)         
                throw new Error("Handlebars Helper equal needs 2 parameters");     
            if (lvalue != rvalue) {         
                return options.inverse(this);     
            } else {         
                return options.fn(this);     
            } 
        }
    }
}));
app.set("view engine", ".hbs");

// Setup client-sessions
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "a6_web322",//secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
  }));

app.use(function(req, res, next) {   
    res.locals.session = req.session;   
    next(); 
}); 


app.use(function(req,res,next){     
    let route = req.baseUrl + req.path;     
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");     
    next(); 
}); 

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
      } else {
        next();
    }
};

//Routes

app.get("/", function(req,res){
    res.render("home");
 });

app.get('/about', function(req, res){
    res.render("about");
});

app.get('/login', function(req, res){
    res.render("login"); 
});

app.get('/register', (req,res) => {
    res.render("register"); 
});

app.get('/employees', ensureLogin,function(req,res){
    if(req.query.status){
        dataService.getEmployeesByStatus(req.query.status) 
        .then(function(data){
            if (data.length>0){
                res.render("employees", {employees: data}); 
            } else{
                res.render("employees",{ message: "no results" }); 
            }
        })
        .catch(function(err){
            res.render({message: "no results"}); 
        })
    } else if(req.query.department){
        dataService.getEmployeesByDepartment(req.query.department)
        .then(function(data){
          if (data.length>0){
            res.render("employees", {employees: data}); 
        } else{
            res.render("employees",{ message: "no results" }); 
        }
        }).catch(function(err){
          res.render({message: "no results"}); 
        })
      }else if(req.query.manager){
        dataService.getEmployeesByManager(req.query.manager)
        .then(function(data){
          if (data.length>0){
            res.render("employees", {employees: data}); 
        } else{
            res.render("employees",{ message: "no results" }); 
        }
        }).catch(function(err){
          res.render({message: "no results"}); 
        })
      }else{
        dataService.getAllEmployees()
        .then(function(data){
            if (data.length>0){
                res.render("employees", {employees: data}); 
            } else{
                res.render("employees",{ message: "no results" }); 
            }
        })
        .catch(function(err){
            res.render({message: "no results"}); 
        });
    }
});

app.get("/employee/:empNum", ensureLogin,(req, res) => { 
    // initialize an empty object to store the values     
    let viewData = {}; 

    dataService.getEmployeeByNum(req.params.empNum).then((data) => {         
        if (data) {             
            viewData.employee = data; //store employee data in the "viewData" object as "employee"     
        } else {             
            viewData.employee = null; // set employee to null if none were returned         
        }     
    }).catch(() => {         
        viewData.employee = null; // set employee to null if there was an error      
    }).then(dataService.getDepartments) //.then(dataService.getDepartments)    
    .then((data) => {         
        viewData.departments = data; // store department data in the "viewData" object as "departments" 

        // loop through viewData.departments and once we have found the departmentId that matches         
        // the employee's "department" value, add a "selected" property to the matching          
        // viewData.departments object 
 
        for (let i = 0; i < viewData.departments.length; i++) {    
            if (viewData.departments[i].departmentId == viewData.employee[0].department) {               
                viewData.departments[i].selected = true;           
            }         
        } 
    }).catch(() => {         
        viewData.departments = []; // set departments to empty if there was an error     
    }).then(() => {         
        if (viewData.employee == null) { // if no employee - return an error             
            res.status(404).send("Employee Not Found");         
        } else { 
            res.render("employee", { viewData: viewData }); // render the "employee" view         
        }     
    }); 
}); 

app.get('/department/:departmentId', ensureLogin,(req,res) =>{
    dataService.getDepartmentById(req.params.departmentId).then((data) =>{
        res.render("department", {department: data});
    }) 
    .catch((err) =>{
        res.status(404).send("Department Not Found"); 
    });
});

app.get('/departments', ensureLogin,function(req,res){
    dataService.getDepartments()
    .then(function(data){
        if (data.length>0){
            res.render("departments", {departments: data}); 
        } else{
            res.render("departments",{ message: "no results" }); 
        }
    })
    .catch(function(err){
        res.render({message: "no results"}); 
    })
});

app.get('/departments/add', ensureLogin,(req,res) =>{
    res.render("addDepartment");
});

app.get('/employees/add', ensureLogin,(req,res) =>{
    dataService.getDepartments()
    .then((data) =>{
        res.render("addEmployee", {departments: data}); 
    })
    .catch((err) =>{
        res.render("addEmployee", {departments: []}); 
    });
});

app.get('/images/add', ensureLogin,(req,res) =>{
    res.render("addImage");
});

app.get("/images", ensureLogin, function(req,res){
    fs.readdir("./public/images/uploaded", (err,items) =>{
        console.log(items);
        res.render("images", {images : items});
    });
 });


 app.get('/employees/delete/:empNum', ensureLogin, (req,res) =>{
    dataService.deleteEmployeeByNum(req.params.empNum)
    .then((data) =>{
        res.redirect("/employees");
    }).catch((err) =>{
        res.status(500).send("Unable to Remove Employee / Employee not found)");
    });
 });

 app.get('/logout', (req,res) =>{
    req.session.reset();
    res.redirect('/'); 
 });

 app.get('/userHistory', ensureLogin, (req,res) =>{
    res.render("userHistory");
 });

 //post routes

app.post('/images/add', upload.single("imageFile"), ensureLogin, (req,res) =>{
    res.redirect("/images");
});

app.post('/employees/add', ensureLogin, (req,res) =>{
    dataService.addEmployee(req.body)
    .then(function(data){
        res.redirect("/employees");
    })
    .catch(function(err){
        res.json({message: err});
    });
});

app.post('/departments/add', ensureLogin, (req,res) =>{
    dataService.addDepartment(req.body)
    .then((data) =>{
        res.redirect('/departments');
    })
    .catch((err) =>{
        res.json({message: err});
    });
});

app.post('/department/update', ensureLogin, (req,res) =>{  
    dataService.updateDepartment(req.body)
    .then(function(data){
        res.redirect("/departments");
    })
    .catch((err) =>{
        res.json({message: error});
    });
});

app.post('/employee/update', ensureLogin, (req, res) => {       
    dataService.updateEmployee(req.body)
    .then(function(data){
        res.redirect("/employees"); 
    })
    .catch(function(err){
        res.json({message: error});
    });
}); 

app.post('/register', (req,res) =>{
    dataServiceAuth.registerUser(req.body)
    .then(() =>{
        res.render("register", {successMessage: "User created"});
    })
    .catch((err) => {
        res.render("register", {errorMessage: err, userName: req.body.userName}); 
    });
});


app.post("/login", (req,res) => {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body)
    .then((user) => {   
        req.session.user = {    
            "userName": user.userName,// authenticated user's userName     
            "email": user.email,// authenticated user's email         
            "loginHistory": user.loginHistory// authenticated user's loginHistory   
        } 
        res.redirect('/employees'); 
    })
    .catch((err) =>{
        res.render("login",  {errorMessage: err, userName: req.body.userName}); 
    });
});



app.use((req,res)=> {
    res.status(404).send("Page Not Found");
});


dataService.initialize() 
.then(dataServiceAuth.initialize) 
.then(function(){     
    app.listen(HTTP_PORT, function(){         
        console.log("app listening on: " + HTTP_PORT);     
    }); 
}).catch(function(err){     
    console.log("unable to start server: " + err); 
});
