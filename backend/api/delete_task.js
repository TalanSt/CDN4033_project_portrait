const { Sequelize } = require("sequelize");
const express = require("express");
const { Helpers, jsonResponses, sqliteObjects } = require("../helpers.js");

/**
 * @param {express.Application} app
 * @param {Sequelize} sequelize
 */
async function endpoint(app, sequelize) {
    app.delete("/api/delete_task", async (req, res) => {
        const { token } = req.headers;
        const Token = token; // this is only here because apparently expressjs reads it in lowercase.

        if(!Token)
            return res.status(401).json(jsonResponses.missingToken);

        if(!req.body)
            return res.status(400).json(jsonResponses.missingInput);

        /** @type {{
         *   taskid: number,
         *   userid: number,
         *   taskName: string,
         *   taskContent: string,
         *   taskDueDate: string,
         *   category: string,
         *   isChecked: boolean
         * }}
         */
        const { taskid, userid } = req.body;

        if(taskid == null || userid == null)
            return res.status(400).json(jsonResponses.missingInput);

        if(typeof taskid != "number" || typeof userid != "number")
            return res.status(400).json(jsonResponses.invalidInput);

        const user = await Helpers.getUserById(userid, sequelize);
        const task = await Helpers.getTaskById(taskid, sequelize);

        if(!user)
            return res.status(400).json(jsonResponses.userDoesNotExist);
        if(!task)
            return res.status(400).json(jsonResponses.taskDoesNotExist);

        // We check if the userids align, if they don't then whoever is requesting has no permission.
        if(task.userid != user.userid)
            return res.status(403).json(jsonResponses.forbidden);

        // We then check the tokens. Since we already know the users are the same,
        // we just need to verify the user is who they say they are.
        if(!Helpers.checkToken(Token, user))
            return res.status(403).json(jsonResponses.forbidden);

        await sequelize.models.Task.destroy({
            where: {
                taskid: task.taskid
            }
        });

        res.status(200).json(jsonResponses.success(200, { 
            taskid: task.taskid,
            userid: user.userid,
            text: `Successfully deleted task ${task.taskid}: ${task.taskname} for user ${user.userid}: ${user.username}`
        }));
    });
}

module.exports = { endpoint }
