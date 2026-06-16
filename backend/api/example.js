const express = require("express");
const fs = require("fs/promises");

/**
 * @param {express.Application}
 */
async function endpoint(app) {
    console.log("Hello from example!");

    const data = await fs.readFile("api/example_response.json", "utf8");

    app.get("/", (req, res) => {
        res.send("Hello!");
    });

    app.get("/api/example", (req, res) => {
        res.send(data);
    });
}

module.exports = { endpoint }
