const { Sequelize } = require("sequelize");
const express = require("express");
const { Helpers } = require("../helpers.js");

/**
 * @param {express.Application}
 * @param {Sequelize}
 */
async function endpoint(app, sequelize) {
    app.post("/api/register", async (req, res) => {
        if(!req.body) {
            return res.status(400).json({
                code: 400,
                success: false,
                message: "Please provide a username and password."
            });
        }

        const { username, password } = req.body;

        if(!username || !password) {
            return res.status(400).json({
                code: 400,
                success: false,
                message: "Please provide a username and password."
            });
        }

        if(!/^[a-zA-Z0-9]+$/.test(username) || !/^[a-zA-Z0-9!@#$%^&*]+$/.test(password)) {
            return res.status(400).json({
                code: 400,
                success: false,
                message: "Username or password is invalid."
            });
        };


        // passwords are kept encrypted in the database!
        try {
            let newuser = await sequelize.models.User.create({ username: username, password: Helpers.encryptString(password) });
            res.status(201).json({
                code: 201,
                success: true,
                message: {
                    id: newuser.id,
                    username: username
                }

            });
        }
        catch(error) {
            if(error.original.errno === 19) {
                res.status(400).json({
                    code: 400,
                    success: false,
                    message: "User already exists",
                });
            }
        }

        
    });
}

module.exports = { endpoint }
