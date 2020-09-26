# SSHS Gyeopgang Backend
# Setup
## Prerequisites

Make sure you installed [Node.js](https://nodejs.org/) and [npm](https://npmjs.com).
When using windows, install unix tools and git bash from [git](https://git-scm.com/download/win).

## Initial setup

Clone this repository and install all dependencies: 

``` shell
$ git clone https://github.com/chosanglyul/gyeopgang-backend.git
$ cd gyeopgang-backend
$ npm i
```

You need an env file for features that use the database.
Make a database account first and make a `.env` file with credentials.

``` shell
$ touch .env
$ cat <<EOF > .env
DB_CONNECTION_STRING="your-db-connection-string"
KEYS="your-koa-secret-key"
EOF
```

Start the server:

``` shell
$ node index
```

[The app](http://localhost:8000) runs on port 8000 on localhost.

# API docs
## /subjects/:code
### POST
### GET
### DELETE

## /subjects/:subjectcode/:classnum
### POST
### GET
### DELETE
### PATCH

## /auth/login
### POST

## /auth/logout
### POST

## /auth/user/:code
### POST
### GET
### DELETE
### PATCH

## /auth/changepw/:code
### POST