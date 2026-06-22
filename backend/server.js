const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const { Sequelize, DataTypes } = require("sequelize");

let useHTTPS = false;
let privateKey;
let certificate;

try {
    privateKey = fs.readFileSync("../key.pem", "utf-8");
    certificate = fs.readFileSync("../cert.pem", "utf-8");
    useHTTPS = true;
} catch(error) {
    console.error("Something went wrong reading your private key and certificate. Starting with HTTP: ", error);
}

const express = require("express");
const { exit } = require("process");
const app = express();

const cors = require("cors");

app.use(cors({
    origin: "https://localhost:5173", // URL of your Vue development server
    credentials: true                 // Allows cookies/headers if you pass sessions later
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const httpPort = 3000;
const httpsPort = 3001;

// sync the database
console.log("Syncing database");

/**
 * @type {Sequelize}
 */
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database/storage/data.sqlite"
});

// Confirm the connection.
try {
    sequelize.authenticate();
    console.log("Successfully connected to database.");
}
catch (error) {
    console.error("Could not connect to database:", error);
    exit();
}

const user = sequelize.define( "User",
    {
        userid: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        username: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false }
    }
);

const task = sequelize.define("Task", 
    {
        taskid: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        userid: { type: DataTypes.INTEGER, allowNull: false },
        taskname: { type: DataTypes.STRING, allowNull: false },
        taskcontent: { type: DataTypes.STRING, allowNull: false },
        taskduedate: { type: DataTypes.DATE, allowNull: false },
        category: { type: DataTypes.STRING, allowNull: false },
        ischecked: { type: DataTypes.BOOLEAN, allowNull: false },
        priority: { type: DataTypes.STRING, allowNull: false }
    }
);

//task.sync({ force: true });

console.log("All models: ", sequelize.models);

//sequelize.sync({ force: true });

// Configuration for express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// This reads all .js files in ./api/ and runs the internal "api" function in them to set up their endpoints.
console.log("Reading files and importing endpoints.");

let files = fs.readdirSync("./api/").filter(
    (str) => path.extname(str) === '.js');

files.forEach(async (file) => {
    console.log(`Reading ${file}`);

    let dir = `./api/${file}`;

    let fileIn = require(dir);

    await fileIn.endpoint(app, sequelize);
});



// Sets all responses to to json
app.use((err, req, res, next) => {
    console.error(err);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        status: statusCode,
        error: err.message || 'Internal Server Error'
    });
});

let httpServer = http.createServer(app);

if(useHTTPS) {
    console.log("HTTPS is enabled. HTTP will be disabled.")

    let credentials = { key: privateKey, cert: certificate }

    let httpsServer = https.createServer(credentials, app);
    httpsServer.listen(httpsPort);
    
    console.log(`Listening for HTTPS on ${httpsPort}. https://localhost:${httpsPort}`);
}
else { 
    httpServer.listen(httpPort); 
    console.log(`Listening for HTTP on ${httpPort}. https://localhost:${httpPort}`);
}
// sequelize.sync({ force: true });
