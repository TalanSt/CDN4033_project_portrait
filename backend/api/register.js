const { Sequelize } = require("sequelize");
const express = require("express");
const { Helpers, jsonResponses } = require("../helpers.js");

/**
 * @param {express.Application} app
 * @param {Sequelize} sequelize
 */
async function endpoint(app, sequelize) {
    app.post("/api/register", async (req, res) => {
        if(!req.body) 
            return res.status(400).json(jsonResponses.missingInput);

        const { username, password } = req.body;

        if(!username || !password)
            return res.status(400).json(jsonResponses.missingInput);

        if(!/^[a-zA-Z0-9]+$/.test(username) || !/^[a-zA-Z0-9!@#$%^&*]+$/.test(password))
            return res.status(400).json(jsonResponses.invalidInput);

        // passwords are kept encrypted in the database!
        try {
            let newuser = await sequelize.models.User.create({ username: username, password: Helpers.encryptString(password) });
            res.status(201).json(jsonResponses.success(201, {
                userid: newuser.userid,
                username: username
            }));
        }
        catch(error) {
            if(error.original.errno === 19) {
                res.status(400).json(jsonResponses.userAlreadyExists);
            }
        }

        
    });
}

module.exports = { endpoint }
