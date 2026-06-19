const prompt = require("node:readline/promises").createInterface({ input: process.stdin, output: process.stdout });

async function main() {

    const start = performance.now();

    const response = await fetch("https://localhost:3001/api/ping");
    const data = await response.json();

    const end = performance.now();
    const duration = end - start;

    console.log(data.message, `(${duration.toFixed(4)} ms)`); // Pong!


    // Create an account
    console.log("\n\n\nCreating account\n");

    const username = await prompt.question("Create Username -> ");
    const password = await prompt.question("Create Password -> ");

    const body = {
        username: username,
        password: password
    }

    const createAccount = await fetch("https://localhost:3001/api/register", {
        method: "POST",
        headers: {
            'User-Agent': 'javascript-example',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const createAccData = await createAccount.json();

    if(!createAccData.success) 
        return console.log(`The response from the server does not indicate a success: ${createAccData.code}, ${createAccData.message}`);

    // Signing in
    console.log("\n\nSigning in\n");

    const user = await prompt.question("Enter username -> ");
    const pass = await prompt.question("Enter password -> ");

    const signInBody = {
        username: user,
        password: pass
    }

    let headers = new Headers();
    headers.append("User-Agent", "javascript-example");
    headers.append("Content-Type", "application/json");

    const signIn = await fetch("https://localhost:3001/api/sing_in", {
        method: "GET",
        headers: headers,
        body: JSON.stringify(signInBody)
    });

    const signInData = await signIn.json();

    if(!data.success)
        return console.log(`The response from the server does not indicate success: ${signInData.code}: ${signInData.message}`);

    const token = signInData.message.token;
    const userid = signInData.messaage.userid;

    headers.append("Token", token);
}

main().catch(console.error);
