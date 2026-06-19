const { Sequelize } = require("sequelize");
const express = require("express");
const { Helpers } = require("../helpers.js");

/**
 * @param {express.Application}
 * @param {Sequelize}
 */
async function endpoint(app, sequelize) {
    app.get("/api/sign_in", async (req, res) => {
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

        const userarr = await sequelize.models.User.findAll({
            where: {
                username: username
            }
        });

        

        if(userarr.length == 0) return res.status(404).json({
            code: 404,
            success: false,
            message: "User does not exist."
        });

        const user = userarr[0];

        console.log(Helpers.decryptString(user.password));

        if(Helpers.decryptString(user.password) != password) return res.status(403).json({
            code: 403,
            success: false,
            message: "Forbidden (wrong password)"
        });

        res.status(200).json({
            code: 200,
            success: true,
            message: {
                username: username,
                userid: user.id,
                token: Helpers.getToken(user)
            }
        });
    });
}

module.exports = { endpoint };
