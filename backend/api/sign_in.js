const { Sequelize } = require("sequelize");
const express = require("express");
const { Helpers, jsonResponses } = require("../helpers.js");

/**
 * @param {express.Application} app
 * @param {Sequelize} sequelize
 */
async function endpoint(app, sequelize) {
    app.post("/api/sign_in", async (req, res) => {
        if(!req.body) {
            return res.status(400).json(jsonResponses.missingInput);
        }

        const { username, password } = req.body;

        if(!username || !password) {
            return res.status(400).json(jsonResponses.missingInput);
        }

        if(!/^[a-zA-Z0-9]+$/.test(username) || !/^[a-zA-Z0-9!@#$%^&*]+$/.test(password)) {
            return res.status(400).json(jsonResponses.invalidInput);
        };

        const user = await Helpers.getUserByName(username, sequelize);

        if(!user) return res.status(404).json(jsonResponses.userDoesNotExist);

        console.log(Helpers.decryptString(user.password));

        if(Helpers.decryptString(user.password) != password) return res.status(403).json(jsonResponses.forbidden);

        res.status(200).json(jsonResponses.success(200, { 
            username: username,
            userid: user.userid,
            token: Helpers.getToken(user)
        }));
    });
}

module.exports = { endpoint };
