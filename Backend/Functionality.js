//this .js file is a backend file that acts the bridge between the frontend and local  mySQL database server where its fetching the data from frontend then forwarding the data to said database.

const express = require('express') // Imports the express module, which is a web application framework for Node.js which provides functionality to do the following: It simplifies routing and handling HTTP (a set of rules we follow when trasnfering info on the internet or bteween our computer and a server) REQUESTS like POST, GET, etc.
/*
Express receives requests and routes your backend code, which then uses a database driver or ORM to communicate with the database.
*/
const mysql = require('mysql')  //  Imports the mysql module, which allows Node.js to interact with mySQL databases.

const cors = require ('cors') // Imports the cors module, which enables Cross-Origin Resource Sharing, allowing your server to handle requests from different origins.
//the three lines above will import the corresponding package/modules from the package.json file.

//the lines below connect to the local databse server via the dotenv file which is converted to .env
const dotenv = require('dotenv');
dotenv.config(); // read from .env file


// if you use .env to configure
console.log("HOST: " + process.env.HOST);
console.log("DB USER: " + process.env.DB_USER);
console.log("PASSWORD: " + process.env.PASSWORD);
console.log("DATABASE: " + process.env.DATABASE);
console.log("DB PORT: " + process.env.DB_PORT);

const connection = mysql.createConnection({
     host: process.env.HOST,
     user: process.env.DB_USER,        
     password: process.env.PASSWORD,
     database: process.env.DATABASE,
     port: process.env.DB_PORT
});

//At this point, we should have successfully connected to the local database server
//the code block below will do an exception handler to verify if we connected to the database
connection.connect((err) => {
     if(err){
        console.log(err.message);
     }
     console.log('db ' + connection.state);    // to see if the DB is connected or not
});


//the following methods are methods used to interact with the database (server-side logic)

const app = express(); //app is an instance of the framework express. app will allows us to execute the provided funcalities from express to do the above stated routes
//creates or uploads new data by grabbing data from html doc where user input is stored to database-> app.post() -> POST REQUEST ()
//read or retrieve only NON-SENSITIVE data from database -> app.get() -> GET REQUEST
//update exsisting data in the database -> app.put() -> PUT REQUEST
//delete data in the database -> app.delete() -> DELETE REQUEST
//The value of the method attribute within the form element fo your html document needs to match the rspective http method/request: ex html -> method=POST, js -> app.post();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

const location = require('path');
app.use(express.static(location.join(__dirname,"../Frontend"))); //because project folder is not in the same location as XAMPP installation (My local machine needed this alt)


//the use of app.post below is to register a new user, grab data (user input from html form) and upload it to users table via local mySQL database server

app.post('/insert', (request, response) => { //we use question marks as pevention of SQL injection attacks for encryption
    const{ UserID, Password, FirstName, LastName, Age, Salary, RegisterDate, LastSignInTime} = request.body;
    const QueryVariable = 'INSERT INTO users (UserID, Password, FirstName, LastName, Age, Salary, RegisterDate, LastSignInTime) VALUES (?, ?, ?, ?, ?, ?, ?, 0)';
    //below is the exception handler in order for the data that is grabbed from the html table to be populated in the users table 
    connection.query(QueryVariable, [UserID, Password, FirstName, LastName, Age, Salary, RegisterDate, LastSignInTime], (error, result) => {
        if(error){
            console.log(error); //console.log is the message that will appear on the console (terminal)
            response.status(500).send("Unable to populate table users"); //response.status is the message that will appear on the .html page
        }
        else{
            console.log("Data successfully populated in table users, sign in!");
            //response.send("Data successfully populated in table users");
             response.redirect(`/SignIn.html`); //redirect users to sign in portal on registration
        }
    });
});




//We WOULD use app.get() but because this deals with sensitive info, we will use 
app.post('/verify', (request, response) => {
    const{ UserID, Password } = request.body;
    const QueryVariable = 'SELECT UserID, Password FROM Users WHERE UserID = ? AND Password = ?';
    connection.query(QueryVariable, [UserID, Password], (error, result) => {
        const Variable = UserID;
        if(result.length > 0){ //If POST request goes through, it will run the query with the database. A successful result should be one array (UserID and Password, must be both!)
            console.log(`Success! Welcome back ${Variable}`); //DONT use qoutes for js vairables, use backsticks
            //response.status(200).send("Success, welcome");
            //window.location.href = "MainPage.html"; <-- this won't work because you're running a Frontend command on a Backend system file 
            response.redirect(`/MainPage.html?User=${Variable}`); //Since you're utlizing express via app, use the express built in redirect tool, more appropriate. 
        } //we need the ? in the URL when redirecting the user to the other page because URLSearchParams method in MainPage.html needs it to find User
        else if(error){
            console.log(error);
            response.status(500).send("There was an error in attempting to match, try again.");
        }
        else{
            console.log("Wrong credintals or account DNE, try again if latter");
            response.status(401).send("Wrong credintals or account DNE, try again if latter");
        }
    });
    
});

//this use of http get is to grab data from database and paste it to the html table
app.get('/GetData', (request, response) => {
    const QueryVariable = 'SELECT * FROM Users';
    connection.query(QueryVariable, (error, results) => {
        if(error){
            console.log(error);
            return response.status(500).send("Error in grabbing data from database to html table");
        }
        response.json(results); //send the data to html table via json
    });
});



//the lines below are used to grab data from the database to table and to grab x data for the respective search the user insists 
/*




document.addEventListener("DOMContentLoaded", function() {
    InitalizeHTMLTable([]);

});

function InitalizeHTMLTable(Data){ //this function is used to load the table on the html doc with the data from the database 
    const Table = document.querySelector("Table tbody"); //variable
 
    if(Data.length == 0){ //Case 1: No data on the database? Thus, no data should be in the table
        Table.innerHTML = "<tr><td class='no data' colspan='5'>Database Null</td></tr>";
    }
}

*/


// if we configure here directly
app.listen(5050, 
    () => {
        console.log("I am listening on the fixed port 5050.")
    }
);
