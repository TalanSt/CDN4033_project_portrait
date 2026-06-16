const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

let privateKey = fs.readFileSync("../key.pem", "utf-8");
let certificate = fs.readFileSync("../cert.pem", "utf-8");

let credentials = { key: privateKey, cert: certificate };

const express = require("express");
const app = express();

const httpPort = 3000;
const httpsPort = 3001;

// This reads all .js files in ./api/ and runs the internal "api" function in them to set up their endpoints.

console.log("Reading files and importing endpoints.");

const files = fs.readdirSync("./api/").filter(
    (str) => path.extname(str) === '.js');

files.forEach(async (file) => {
    console.log(`Reading ${file}`);

    let dir = `./api/${file}`;

    let fileIn = require(dir);

    await fileIn.endpoint(app);
});

let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);

httpServer.listen(httpPort);
httpsServer.listen(httpsPort);
