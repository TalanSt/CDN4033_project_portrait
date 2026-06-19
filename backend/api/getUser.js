const { Sequelize } = require("sequelize");
const express = require("express");
const { Helpers } = require("../helpers.js");

/**
 * @param {express.Application} app
 * @param {Sequelize} sequelize
 */
async function endpoint(app, sequelize) {
    app.get("/api/users", async (req, res) => {
        if(!req.body) return res.status(403).json({

            status: 403,
            success: false,
            message: "Forbidden"
        });

        const { auth } = req.body;

        if(auth != "funnyadminpassword") return res.status(403).json({
            status: 403,
            success: false,
            message: "Forbidden"
        });


        const users = await sequelize.models.User.findAll();

        res.status(200).json({
            status: 200,
            success: true,
            message: users
        });
    });
}

module.exports = { endpoint }
