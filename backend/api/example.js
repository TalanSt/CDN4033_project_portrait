const express = require("express");
const fs = require("fs/promises");
const { Sequelize } = require("sequelize");

/**
 * @param {express.Application}
 * @param { Sequelize }
 */
async function endpoint(app, sequelize) {
    console.log("Hello from example!");

    const data = await fs.readFile("api/example_response.json", "utf8");

    app.get("/", (req, res) => {
        res.send("Hello!");
    });

    app.get("/api/example", (req, res) => {
        res.json(data);
    });


}

module.exports = { endpoint }
