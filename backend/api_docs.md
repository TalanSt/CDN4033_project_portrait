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
