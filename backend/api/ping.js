const express = require("express");
const fs = require("fs/promises");
const { Sequelize } = require("sequelize");
const { jsonResponses } = require("../helpers");

/**
 * @param {express.Application} app
 * @param { Sequelize } sequelize
 */
async function endpoint(app, sequelize) {
    app.get("/api/ping", (req, res) => {
        res.status(200).json(jsonResponses.success(200, "Pong!"))
    }); 
}

module.exports = { endpoint }
