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

#### Example 1: OK

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

#### Example 2: Error

The message changes depending on the error.

```json
{
    "code": 403,
    "success": false,
    "message": "Forbidden (wrong password)"
}
```

### Make Task

POST `api/make_task`

Token is required.

Body input:

```json
{
    "userid": 1,
    "taskName": "string",
    "taskContent": "string",
    "taskDueDate": "YYYY-MM-DD",
    "category": "string",
    "isChecked": false
}
```

taskDueDate must be able to convert into a date.

All strings must only have alphanumeric values and/or "!@#$%^&*"

| Status | Meaning | Description | Schema |
| ------ | ------- | ----------- | ------ |
| 201 | Complete | Task was made | See example \#1 |
| 400 | Bad request | Missing input | See example \#2 |
| 401 | Unauthorized | Missing token | See example \#2 |
| 400 | Bad request | Bad input | See example \#2 |
| 403 | Forbidden | Mismatched Token | See example \#2 |
| 404 | Does not exist | User ID doesn't exist | See example \#2 |

#### Example 1: Task was made

The server will return details about the task.

```json
{
    "code": 201,
    "success": true,
    "message": {
        "taskid": 1,
        "userid": 1,
        "taskname": "Hello",
        "taskcontent": "World!",
        "taskduedate": "2026-10-10T04:00:00.000Z",
        "category": "Homework",
        "ischecked": false,
        "updatedAt": "2026-06-19T18:05:00.836Z",
        "createdAt": "2026-06-19T18:05:00.836Z"
    }
}
```

#### Example 2: Errors

The message changes depending on the error.

```json
{
    "code": 401,
    "success": false,
    "message": "Missing token"
}
```

### Get Task

GET `api/get_task`

Returns the specified task.

Token is required.

Body:

```json
{
    "taskid": 1,
    "userid": 1
}
```

I'll write the table of responses some other time. I'll give examples though:

Example Responses:

```json
{
    "code": 200,
    "success": true,
    "message": {
        "taskid": 1,
        "userid": 1,
        "taskname": "User 1 Task 1",
        "taskcontent": "Example Task",
        "taskduedate": "2026-10-10T04:00:00.000Z",
        "category": "Homework",
        "ischecked": false,
        "createdAt": "2026-06-19T18:48:51.907Z",
        "updatedAt": "2026-06-19T18:48:51.907Z"
    }
}
```

```json
{
    "code": 403,
    "success": false,
    "message": "Forbidden"
}
```

### Get Tasks

GET `api/get_tasks`

Returns all of the tasks associated with the user.

Token is required.

Body:

```json
{
    "userid": 1
}
```

Example Responses:

```json
{
    "code": 200,
    "success": true,
    "message": [
        {
            "taskid": 1,
            "userid": 1,
            "taskname": "User 1 Task 1",
            "taskcontent": "Example Task",
            "taskduedate": "2026-10-10T04:00:00.000Z",
            "category": "Homework",
            "ischecked": false,
            "createdAt": "2026-06-19T18:48:51.907Z",
            "updatedAt": "2026-06-19T18:48:51.907Z"
        },
        {
            "taskid": 2,
            "userid": 1,
            "taskname": "User 1 Task 2",
            "taskcontent": "Example Task",
            "taskduedate": "2026-10-10T04:00:00.000Z",
            "category": "Homework",
            "ischecked": false,
            "createdAt": "2026-06-19T18:49:11.719Z",
            "updatedAt": "2026-06-19T18:49:11.719Z"
        }
    ]
}```

```json
{
    "code": 403,
    "success": false,
    "message": "Forbidden"
}
```
