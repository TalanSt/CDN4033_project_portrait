const { Sequelize } = require("sequelize");
const express = require("express");
const { Helpers, jsonResponses } = require("../helpers.js");

/**
 * @param {express.Application} app
 * @param {Sequelize} sequelize
 */
async function endpoint(app, sequelize) {
    app.post("/api/register", async (req, res) => {
        if (!req.body) {
            return res.status(400).json(jsonResponses.missingInput);
        }

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json(jsonResponses.missingInput);
        }

        if (!/^[a-zA-Z0-9]+$/.test(username) || !/^[a-zA-Z0-9!@#$%^&*]+$/.test(password)) {
            return res.status(400).json(jsonResponses.invalidInput);
        }

        try {
            // passwords are kept encrypted in the database
            const newuser = await sequelize.models.User.create({ 
                username: username, 
                password: Helpers.encryptString(password) 
            });
            
            // added explicit return to terminate the request line cleanly!
            return res.status(201).json(jsonResponses.success(201, {
                id: newuser.userid,
                username: username
            }));
        }
        catch (error) {
            console.error("Database Transaction Exception:", error);

            // guard against undefined objects before reading properties
            if (error.original && error.original.errno === 19) {
                return res.status(400).json(jsonResponses.userAlreadyExists);
            }

            // global fallback response ensures the frontend unfreezes on any server crash
            return res.status(500).json({
                code: 500,
                success: false,
                message: "Internal server database error."
            });
        }
    });
}

module.exports = { endpoint };