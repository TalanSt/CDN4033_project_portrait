const crypto = require("node:crypto");
const fs = require("fs");
const { Sequelize, Model } = require("sequelize");

// generate an AES encryption key if it does not exist:
if(!fs.existsSync("./key_sqlite.pem")) {
    console.log("Generating new key for sqlite. If data existed before, it is now unobtainable!");
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const hexbytes = Array.from(bytes)
        .map(b => b.toString(32).padStart(2, '0'))
        .join('');

    fs.writeFileSync("./key_sqlite.pem", hexbytes)
}

const key = fs.readFileSync("./key_sqlite.pem").toString().split('\n')[0];
const algorithm = 'aes-256-gcm';

console.log(key.length);

class Helpers {
    /**
    * Encrypts a string
    * @param {string}
    */
    static encryptString(text) {
        if(typeof text != "string") return null;

        const salt = crypto.randomBytes(16);
        const iv = crypto.randomBytes(12);

        const cipher = crypto.createCipheriv(algorithm, 
            crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256'), 
            iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authtag = cipher.getAuthTag().toString('hex');

        return `${salt.toString('hex')}:${iv.toString('hex')}:${authtag}:${encrypted.trim('}')}`;
    };

    /**
    * Decrypts a string
    * @param {string}
    */
    static decryptString(text) {
        if(typeof text != "string") return null;

        const [saltHex, ivHex, authtagHex, encryptedText] = text.split(":");

        const salt = Buffer.from(saltHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authtagHex, 'hex');
        
        const decipher = crypto.createDecipheriv(algorithm, 
            crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256'), 
            iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Gets a token for a user based on a few factors
     */
    static getToken(user) {
        /**
         * @type {Date}
         */
        const updatedAt = user.updatedAt;

        return crypto.createHmac("sha256", key)
            .update(updatedAt.getUTCMilliseconds().toString())
            .digest("base64");
    }

    /**
     * Checks if the user exists in the database. If they do, returns the user.
     * Returns null otherwise. Checks by id.
     * @param {number} userid
     * @param {Sequelize} sequelize
     */
    static async getUserById(userid, sequelize) {
        const userarr = await sequelize.models.User.findAll({
            where: {
                userid: userid
            }
        });

        if(userarr.length === 0) return null;

        return userarr[0];
    }

    /**
     * Checks if the user exists in the database. If they do, returns the user.
     * Returns null otherwise. Checks by Username.
     * @param {string} username
     * @param {Sequelize} sequelize
     */
    static async getUserByName(username, sequelize) {
        const userarr = await sequelize.models.User.findAll({
            where: {
                username: username
            }
        });

        if(userarr.length === 0) return null;

        return userarr[0];
    }

    /**
     * Checks if the given token is valid with the given user.
     * Returns true if token is correct, false otherwise.
     * @returns {boolean}
     * @param {string} token
     * @param {Model<any, any>} user
     */
    static checkToken(token, user) {
        let correctToken = this.getToken(user);

        if(correctToken === token) return true;
        return false;
    }

    /**
     * Checks if the given string is only numeric. Returns that number if it is.
     * Returns null if it is not.
     * @param {string} str
     */
    static isNumeric(str) {
        let trim = str.trim();
        let num = Number(str);

        if(trim !== "" && !isNaN(num)) return num;
        return null
    }

    /**
     * Checks if the given string is a boolean. Returns the value if it is.
     * Returns null otherwise.
     * @param {string} str
     */
    static isBool(str) {
        let trim = str.trim().toLowerCase();

        if(trim === "true" || trim === "tru" || trim === "tr" || trim === "t") return true;
        if(trim === "false" || trim === "fals" || trim === "fal" || trim === "fa" || trim === "f") return false;
        return null;
    }

    /**
     * Checks if the task exists in the database. If they do, returns the task.
     * Returns null otherwise. Checks by id.
     * @param {number} taskid
     * @param {Sequelize} sequelize
     */
    static async getTaskById(taskid, sequelize) {
        const taskarr = await sequelize.models.Task.findAll({
            where: {
                taskid: taskid
            }
        });

        if(taskarr.length === 0) return null;

        return taskarr[0];
    }

    /**
     * Checks if the tasks exists in the database. If they do, returns the tasks.
     * Returns null otherwise. Checks by user id.
     * @param {number} userid
     * @param {Sequelize} sequelize
     */
    static async getTasksByUserId(userid, sequelize) {
        const taskarr = await sequelize.models.Task.findAll({
            where: {
                userid: userid
            }
        });

        if(taskarr.length === 0) return null;

        return taskarr;
    }

}


/**
 * Represents a alot of json responses.
 */
class jsonResponses {
    static userDoesNotExist = {
        code: 404,
        success: false,
        message: "User does not exist"
    }

    static taskDoesNotExist = {
        code: 404,
        success: false,
        message: "Task does not exist"
    }

    static userAlreadyExists = {
        code: 400,
        success: false,
        message: "User already exists"
    }

    static invalidInput = {
        code: 400,
        success: false,
        message: "Invalid input"
    }

    static missingInput = {
        code: 400,
        success: false,
        message: "Missing input arguments."
    }

    static forbidden = {
        code: 403,
        success: false,
        message: "Forbidden"
    }

    static unauthorized = {
        code: 401,
        success: false,
        message: "Unauthorized"
    }

    static missingToken = {
        code: 401,
        success: false,
        message: "Missing token"
    }

    /**
     * @param {number} code
     * @param {object} message
    */
    static success = (code, message) => {
        return {
            code: code,
            success: true,
            message: message
        }
    }
}

/**
 * Makes the jsons for sqlite insertion.
*/
class sqliteObjects {
    

    /**
     * @param {number} userid
     * @param {string} taskname
     * @param {string} taskcontent
     * @param {Date} taskduedate
     * @param {string} category
     * @param {boolean} ischecked
    */
    static task = (userid, taskname, taskcontent, taskduedate, category, ischecked, priority) => {
        return {
            userid: userid,
            taskname: taskname,
            taskcontent: taskcontent,
            taskduedate: taskduedate,
            category: category,
            ischecked: ischecked,
            priority: priority
        }
    }
}

module.exports = { Helpers, jsonResponses, sqliteObjects }
