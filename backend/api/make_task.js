const { Sequelize } = require("sequelize");
const express = require("express");
const { Helpers, jsonResponses, sqliteObjects } = require("../helpers.js");

/**
 * @param {express.Application} app
 * @param {Sequelize} sequelize
 */
async function endpoint(app, sequelize) {
    app.post("/api/make_task", async (req, res) => {
        const { token } = req.headers;
        const Token = token; // this is only here because apparently expressjs reads it in lowercase.

        if(!req.body)
            return res.status(400).json(jsonResponses.missingInput);

        /** @type {{
            *   userid: number,
            *   taskName: string,
            *   taskContent: string,
            *   taskDueDate: string,
            *   category: string,
            *   isChecked: boolean
            * }}
            */
        const { userid, taskName, taskContent, taskDueDate, category, isChecked, priority } = req.body;

        const dueDate = Date.parse(taskDueDate);

        if(!Token) 
            return res.status(401).json(jsonResponses.missingToken);

        if(userid == null | !taskName | !taskContent | !taskDueDate | !category | isChecked == null | !priority)
            return res.status(400).json(jsonResponses.missingInput);

        if(!/^[a-zA-Z0-9!@#$%^&* ]+$/.test(taskName + taskContent + category) || typeof userid != "number" || typeof isChecked != "boolean" || !dueDate)
            return res.status(400).json(jsonResponses.invalidInput);

        const user = await Helpers.getUserById(userid, sequelize);

        if(!user)
            return res.status(404).json(jsonResponses.userDoesNotExist);

        // IMPORTANT: THIS JUST CHECKS IF THE GIVEN USERID AND TOKEN MATCH
        if(!Helpers.checkToken(Token, user))
            return res.status(403).json(jsonResponses.forbidden);

        const task = await sequelize.models.Task.create(sqliteObjects.task(userid, taskName, taskContent, dueDate, category, isChecked, priority));


        console.log(task);

        return res.status(201).json(jsonResponses.success(201, task));
    });
}

module.exports = { endpoint }
