# Explanation

This is intended to give a very basic program and usage of the API.

These are written in Javascript, but should be practical regardless
of language.

## Prerequisites

You will specifically need the backend running in HTTPS mode to make this work.

Additionally, add `NODE_TLS_REJECT_UNAUTHORIZED=0` to your environment variables.

DO NOT do the above permanently as it is a major security risk!
It is needed here since we self-signed the certificate.
(Unless you bought one, I guess)

## Step By Step

## Step 1: Asynchronous Operation

First, we must start in asynchronous. This is necessary since almost all HTTP requests
will return a Promise, and therefore need to have `await` attached to them.

We do this with:

```js
async function main() {
    ...
}

main().catch(console.error);
```

This makes our code run in asynchronous operation, and allows us to use the
`await` operator in our code.

We need the `.catch(console.error)` since if our code errors we won't know
what happened.

If you'd like to read more on asynchronous operation and why it is useful,
check out the [Mozilla documentation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing)

## Step 2: Ping the server

The API has an endpoint at `api/ping` that we will use to verify our connection.

We can do this by using the `fetch()` function:

```js
const start = performance.now();

const response = await fetch("https://localhost:3001/api/ping");
const data = await response.json();

const end = performance.now();
const duration = end - start;

console.log(data.message, `(${duration.toFixed(4)} ms)`); // Pong!
```

What you should see is: `Pong! (24.1060 ms)` in the console!

If you see an error like
`Error: self-signed certificate`
Refer to the prerequisites section of this document.

We utilize `performance.now()` to measure the ping accurately
in our program.

Note how `fetch()` and `response.json()` need to have the `await`
operator. This is because these functions represent asynchronous
calls that if you do not await will cause issues.

We will utilize `fetch()` in almost all of our requests to the server.

## Step 3: Register a user

We can utilize `api/register` to register a new user.
We will start needing to use the API documentation here!
This looks something like this:

```js
// Create an account
console.log("\n\n\n");

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

if(createAccData.code != 201) 
    return console.log(`The response from the server does not indicate ..`);
```

First, we prompt the user for a username and password to create an account.

We then put this data into a `body` variable
to be turned into a [JSON](https://en.wikipedia.org/wiki/JSON) string.

The important bit is how we format our `fetch()`. We must specify a few things:

- Most importantly, the `method` property: This will determine how we send our
request to the server. If the server does not accept the method at the endpoint,
it will return a `404` and error.

- Next, our `headers`. This is simply an object to tell the server "what we are"
and what data we are sending.

- Lastly, the `body`. Earlier, we made a `body` variable, and here we turn it into
a string so the server can read that JSON string and process the data we send.

Here, we are sending over our username and password. The server will process this
data and respond to us when complete.

*Since we are using HTTPS, this is fairly secure. Though it could be better.*

The last bit is error checking. Typically, if your `data.code` is not within 100-399,
that represents some kind of error. In particular, the server here may respond
with something like

```json
{
    "code": 400,
    "success": false,
    "message": "User already exists"
}
```

Which informs us that the username we attempted to use already exists.

Every response from the server contains a `code`, `success`, and `message`
data field, so we can use them here to report if there was any error.

The datatype of `message` varies, but `code` is always a `number` and
`success` is always a `boolean`.

## Sign in

Mostly the same as last time, but with a few key differences

Mainly, signing in will give us a token and a user id that we must save.

We need these to make future requests to the server, or else they will
give us an error.

Sign in's message object (on success) will look like

```json
{
    "username": "user",
    "userid": 1234,
    "token": "token here"
}
```

Tokens are utilized all over the internet for authorization and
authentication. GitHub even uses them!

We save these values with

```js
const token = signInData.message.token;
const userid = signInData.messaage.userid;
```

*Never share tokens with anyone.*

We make a headers object earlier to make it easier to keep track,
and here we add the Token to those headers. Any requests from here
on without a token will be immediately given a `Missing token` error.

