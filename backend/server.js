const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

let privateKey = fs.readFileSync("../key.pem", "utf-8");
let certificate = fs.readFileSync("../cert.pem", "utf-8");

let credentials = { key: privateKey, cert: certificate };

const express = require("express");
const { exit } = require("process");
const app = express();

const httpPort = 3000;
const httpsPort = 3001;

// This reads all .js files in ./api/ and runs the internal "api" function in them to set up their endpoints.

console.log("Reading files and importing endpoints.");

let files = fs.readdirSync("./api/").filter(
    (str) => path.extname(str) === '.js');

files.forEach(async (file) => {
    console.log(`Reading ${file}`);

    let dir = `./api/${file}`;

    let fileIn = require(dir);

    await fileIn.endpoint(app);
});

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
        id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
        username: {type: DataTypes.STRING, allowNull: false, unique: true},
        password: {type: DataTypes.STRING, allowNull: false}
    }
);


user.sync({ force: true });

console.log("Listening for HTTP and HTTPS calls.");

let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);

httpServer.listen(httpPort);
httpsServer.listen(httpsPort);
