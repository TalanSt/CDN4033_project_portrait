# API Documentation

## Headers

Unless specified, ALL requests are required to have a `Token` header.
This is to verify the user.

You can do this via:

```javascript
let headers = new Headers();
headers.append('Token', '<token>');
```

## Endpoints

The default endpoint will be `https://localhost:3001/api/`

If you are not using https, it will be `https://localhost:3000/api/`

## Formatting of Documentation

The general format of all these docs will look like this:

GET `/api/example`

Gets an example response. Since this is for example,
Token is not required to be valid.

Parameters:

| Name | In | Type | Required | Description |
| ---- | -- | ---- | -------- | ----------- |
| example | Query | string | true | A random string. Can be anything. |

Responses:

| Status | Meaning | Description | Schema |
| ------ | ------- | ----------- | ------ |
| 200 | OK | none | ./api/example_response.json |
| 500 | Internal Server Error | none | none |

Example Response:

```json
{
    "data": {
        "message": "Hello there!"
    }
}
```

## Utilizing The API

You use this via:

```javascript

const response = await fetch("https://localhost:3001/api/example",
    method: 'GET',
    headers: headers
    body: JSON.stringify({ example: "Hello World!" })
);

const data = await response.json();

console.log(data);

```

## All Endpoints

### Register

POST `/api/register`

Token is not required in header.

Body (JSON Object):

```json
{
    "username": "string",
    "password": "string"
}
```

Username must only be alphanumeric.
Password must only be alphanumeric + !@#$%^&*

Responses:

| Status | Meaning | Description | Schema |
| ------ | ------- | ----------- | ------ |
| 201 | Created |  Account created | See example \#1 |
| 400 | Bad request | Username Already Exists | See Example \#2 |
| 400 | Bad request | Username or password not provided | See example \#2 |
| 400 | Bad request | Username or password has invalid characters | See example \#2 |

#### Example 1: Returns a success message

```json
{
    "code": 200,
    "success": true,
    "message": {
        "id": 5980,
        "username": "JohnDoe"
    }
}
```

#### Example 2: Returns an error message

The message varies depending on the error.

```json
{
    "code": 400,
    "success": false,
    "message": "User already exists"
}
```

### Sign in

GET `/api/sign_in`

Token is not required in header.

Body (JSON object)

```json
{
    "username": "string",
    "password": "string"
}
```

Username must only be alphanumeric.
Password must only be alphanumeric + !@#$%^&*

Responses:

| Status | Meaning | Description | Schema |
| ------ | ------- | ----------- | ------ |
| 200 | OK | none | See example \#1 |
| 400 | Bad request | Username or password not provided | See example \#2 |
| 400 | Bad request | Username or password has invalid characters | See example \#2 |
| 404 | Does not exist | User does not exist. | See example \#2 |
| 403 | Forbidden | Incorrect password | See example \#2 |

### Example 1: OK

Server responds with user data. Remember to save the token!

```json
{
    "code": 200,
    "success": true,
    "message": {
        "username": "JohnDoe",
        "userid": 5980,
        "token": "The token is a base64 sha256 hash. Just pretend this is."
    }
}
```

### Example 2: Error

The message changes depending on the error.

```json
{
    "code": 403,
    "success": false,
    "message": "Forbidden (wrong password)"
}
```
