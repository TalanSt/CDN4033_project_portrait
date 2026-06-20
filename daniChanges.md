# All changes

## Changes done by me so far

- Added a vue.js project within backend using `npm create vue@latest`
- Edited the gitignore to encompass general tags off of gitignore.io
- setup a basic login screen ui

## Documented Setup for getting everything running

Make sure to have node, npm, git, openssl, and mkcert all installed.
This will also expect you are using a unix-based system as we will be using commands such as `mv` and `ls`.

Use git clone to download the web app locally to your device.
You will need two active terminal sessions to work.

### Backend terminal session

`cd` into the backend folder, and first make an openssl key using talans command and move it into the the route folder
this will make the openssl keys needed to run a secure HTTPS server:

```bash
# Creates the open
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 -nodes

# Moves them to the root folder
mv key.pem ../key.pem
mv cert.pem ../cert.pem
```

then all you need to do is within the backend directory run:

```bash
# install all relevant node packages
npm install

# run the app
npm run start
```

this will leave the backend running so the all the data can stay secure, and available

### Frontend terminal session

With a seperate terminal session, `cd frontend/portrait`

from there all you need to do is

```bash
npm install

npm run dev
```

that will start up the frontend and will give you a link that will let you use the app from your browser.