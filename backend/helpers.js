const crypto = require("node:crypto");
const fs = require("fs");

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
}

module.exports = { Helpers }
