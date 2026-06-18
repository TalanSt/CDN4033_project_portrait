const crypto = require("node:crypto");
const fs = require("fs");

const key = fs.readFileSync("./key_sqlite.pem").toString().split('\n')[0];
const algorithm = 'aes-256-gcm';

console.log(key.length);

/**
 * Encrypts a string
 * @param {string}
*/
function encryptString(text) {
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
function decryptString(text) {
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

module.exports = {
    encryptString,
    decryptString
}
