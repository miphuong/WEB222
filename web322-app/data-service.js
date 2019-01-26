const Sequelize = require('sequelize');

var sequelize = new Sequelize('d3hqjj3rcht9qd','odyzcvhvjgbjfk','b879ea680060201e64a56932058195ba1c94c27791171909f6a42280d1df76b1', {
    host: 'ec2-23-21-216-174.compute-1.amazonaws.com',     
    dialect: 'postgres',     
    port: 5432,     
    dialectOptions: {         
        ssl: true   
    },  
    operatorsAliases:false
});


//Define an "Employee" model
var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true, // use "project_id" as a primary key
        autoIncrement: true // automatically increment the value
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
});

//Define Department Model
var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true, // use "project_id" as a primary key
        autoIncrement: true // automatically increment the value
    },
    departmentName: Sequelize.STRING
});

module.exports.initialize = () => {
    return new Promise(function (resolve, reject) {// create a promise object/instance        
        sequelize.sync().then((Employee) => {
            resolve();
        }).then((Department) => {
            resolve();
        }).catch((err) => {
            reject("unable to sync the database");
        });
    });
};


module.exports.getAllEmployees = () => {
    return new Promise(function (resolve, reject) {    
        sequelize.sync().then(() =>{
            resolve(Employee.findAll()); 
        }).catch((err) => {
            reject("no results returned");
        });
    });
};

module.exports.getEmployeesByStatus = (status) => {
    return new Promise(function (resolve, reject) {         
        sequelize.sync().then(() =>{
            resolve(Employee.findAll({
                where: {
                    status: status
                }
            }));
        }).catch((err) => {
            reject("no results returned");
        });
    });
};

module.exports.getEmployeesByDepartment = (department) => {
    return new Promise(function (resolve, reject) {    
        sequelize.sync().then(() =>{
            resolve(Employee.findAll({
                where: {
                    department: department
                }
            }));
        }).catch((err) =>{
            reject("no results returned");
        });  
    });
};

module.exports.getEmployeesByManager = (manager) => {
    return new Promise(function (resolve, reject) {         
        sequelize.sync().then(() =>{
            resolve(Employee.findAll({
                where: {
                    employeeManagerNum: manager
                }
            }));
        }).catch((err) =>{
            reject("no results returned");
        }); 
    });
}; 

module.exports.getEmployeeByNum = (value) => {
    return new Promise(function (resolve, reject) {         
        sequelize.sync().then(() => {
            resolve(Employee.findAll({
                where: {employeeNum: value}
            }));
        }).catch((err) =>{
            reject("no results returned");
        }); 
    });
};

module.exports.getDepartments = () => {
    return new Promise(function (resolve, reject) {        
        sequelize.sync().then(() =>{
            resolve(Department.findAll());
        }).catch((err) =>{
            reject("no results returned");
        }); 
    });
};

module.exports.addEmployee = (employeeData) => {
    employeeData.isManager = (employeeData.isManager) ? true : false; 
    return new Promise(function (resolve, reject) {         
        //check for blank values ("")
        for(const prop in employeeData) {
            if(employeeData[prop] == ""){
                employeeData[prop] = null;
            }
        }
        //create employee
        Employee.create({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate
        }).then(() =>{
            resolve(); 
        }).catch((err) =>{
            resolve("unable to create employee");
        });
    });
};

module.exports.updateEmployee = (employeeData) => {
    employeeData.isManager = (employeeData.isManager) ? true : false; 
    return new Promise(function (resolve, reject) {
        //update Employee
        Employee.update({
            //employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate
        }, {
            where: {employeeNum: employeeData.employeeNum}
        }).then(() =>{
            resolve();
        }).catch((err) =>{
            reject('unable to update employee');
        });
    });
};

module.exports.addDepartment = (departmentData) =>{
    return new Promise(function(resolve,reject){
        //check for blank values ("")
        for(const prop in departmentData){
            if (departmentData[prop] == ""){
                departmentData[prop] = null;
            }
        }

        //create department
        Department.create({
            departmentId: departmentData.departmentID,
            departmentName: departmentData.departmentName
        }).then(() =>{ 
            resolve();
        }).catch((err) =>{
            reject('unable to create department');
        });
    });
};

module.exports.updateDepartment = (departmentData) =>{
    return new Promise((resolve,reject) =>{
        //check for blank values ("")
        for(const prop in departmentData){
            if(departmentData[prop] == ""){
                departmentData[prop] = null;
            }
        }

        //update department
        Department.update({
            departmentName: departmentData.departmentName
        }, {
            where: {departmentId: departmentData.departmentId}
        }).then(() =>{
            resolve();
        }).catch((err) =>{
            reject('unable to update department');
        });
    });
};

module.exports.getDepartmentById = (id) =>{
    return new Promise((resolve,reject) => {
        sequelize.sync().then(() =>{
            resolve(Department.findAll({where:{departmentId: id}}));
        }).catch((err) =>{
            reject('no results returned');
        });
    });
};


module.exports.deleteEmployeeByNum = (empNum) =>{
    return new Promise((resolve,reject) =>{
        sequelize.sync().then(() =>{
            resolve(Employee.destroy({where: {employeeNum: empNum}}));
        }).catch((err) =>{
            reject("Can not delete employee");
        });
    });
};
