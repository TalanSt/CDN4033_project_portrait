# Quickstart Manual

This quickstart manual should, by the end, provide you with a running version of Portrait - the web-based task manager of the future.

To do this you will first need a couple of tools & pre-reqs:

- A terminal emulator
- Git
- Node.js
- openssl
- mkcert 

Each of the above can be installed depending on your operating system:

- Windows: Go to each of the above's download pages and download their individual installers & follow their steps
- Other OS's: Use your preferred package manager of choice to install them onto your system

Once everything is installed, make sure to clone this repository directly on your computer using:

```zsh
git clone https://github.com/TalanSt/CDN4033_project_portrait

cd CDN4033_project_portrait
```

From here on we will need two seperate terminals running one for the backend and another in the frontend so we will split up this quickstart into the two.

## Backend Manual

Firstly change into the backend and use npm to install all the required packages,
along with that we need to set up the openssl and mkcert steps in order to create a secure
HTTPS connection and lastly run the code:

```zsh
# Moves you to the backend folder
cd backend

# Installs all required node packages
npm install

# Creates the necessary openssl keys
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 -nodes

# Sends you back and creates the certificate authority
cd ../
mkcert -install
mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 ::1

# Sends you back to backend & runs the backend
cd backend
npm run start
```

## Frontend Manual

All to set up the frontend is to install the appropriate node packages
and from there run the server which will give you a link to use.

```zsh
# Changes into frontend
cd frontend/portrait

# Installs relevant packages
npm install

# Runs the web app
npm run dev
```

## Conclusion

With the app set-up you can use it as you want and create an account for yourself, log-in, create tasks, edit them and so on.