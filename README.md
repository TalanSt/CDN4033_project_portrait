# Portrait

Portrait is a simple task manager, designed to allow users to create, modify, and delete tasks.

## CDN4033

This is intended as a project for CDN4033 - Secure Software Engineering. However, this should be broadly usable!

## Inside

You will find 2 primary folders in here, ./frontend and ./backend

The frontend and backend are both written in JavaScript.

## Prerequisites

[NodeJS](https://nodejs.org/en) is required to run the program.

[Git](https://git-scm.com/) is required to install updates and push changes.

[Github CLI](https://cli.github.com/) and [Github Desktop](https://desktop.github.com/download/) may be useful.

[OpenSSL](https://openssl-library.org/) will be needed for HTTPS support.

## Running

### Installation

From your terminal, you can run

```bash
git clone https://github.com/TalanSt/CDN4033_project_portrait
```

And the repository will be added to your computer to `./CDN4033_project_portrait`
See next sections on how to run the program.

### Auto

NOT YET IMPLEMENTED. SEE NEXT SECTION

There are 4 scripts used to start them. Please use the one intended for your OS.
*.sh is for Linux.
*.ps is for Windows.

Both scripts should be identical. Run them from your terminal.

### Manual

If you want to run it without using the scripts:

First you will need to generate a private key and a certificate for HTTPS.
Run the following in the root directory and follow the prompts:


```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 -nodes
```

*Note that this certificate and private key are not password protected.*

To run the backend, run:

```bash
# Update the repository to latest, run this every time.
git pull origin main
# Move terminal into backend
cd ./backend/
# Download and install npm modules
npm install
# Set up config on first run
node set_up_config.js
# Starts the backend
npm start
```

(`set_up_config.js` is not implemented yet, skip it.)

View ./backend/api_docs.md for information on how to utilize the API.
