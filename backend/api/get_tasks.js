const { Sequelize, json } = require("sequelize");
const express = require("express");
const { Helpers, jsonResponses, sqliteObjects } = require("../helpers.js");

/**
 * @param {express.Application} app
 * @param {Sequelize} sequelize
 */
async function endpoint(app, sequelize) {
    app.get("/api/get_tasks", async (req, res) => {
        const { token } = req.headers;
        const Token = token; // this is only here because apparently expressjs reads it in lowercase.

        if(!Token)
            return res.status(401).json(jsonResponses.missingToken);

        if(!req.body)
            return res.status(400).json(jsonResponses.missingInput);

        const { userid } = req.body;

        if(userid == null)
            return res.status(400).json(jsonResponses.missingInput);

        if(typeof userid != "number")
            return res.status(400).json(jsonResponses.invalidInput);

        const user = await Helpers.getUserById(userid, sequelize);
        const tasks = await Helpers.getTasksByUserId(userid, sequelize);

        if(!user)
            return res.status(400).json(jsonResponses.userDoesNotExist);
        if(!tasks)
            return res.status(400).json(jsonResponses.taskDoesNotExist);

        // We check if the userids align, if they don't then whoever is requesting has no permission.
        if(tasks[0].userid != user.userid)
            return res.status(403).json(jsonResponses.forbidden);

        // We then check the tokens. Since we already know the users are the same,
        // we just need to verify the user is who they say they are.
        if(!Helpers.checkToken(Token, user))
            return res.status(403).json(jsonResponses.forbidden);

        return res.status(200).json(jsonResponses.success(200, tasks));
    });
}

module.exports = { endpoint }
