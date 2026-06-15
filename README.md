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

If you want to run the backend without using the scripts:

```bash
cd ./backend/
git pull origin main
npm install
node set_up_config.js
npm start
```

(`set_up_config.js` is not implemented yet, skip it.)
