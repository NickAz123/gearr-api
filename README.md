# GEARR API

`v1.0.0`

The API and backend interface for the GEARR Application. Based off of `v1.0.0` of the `node-dev-api` template.

## Features

- `Node/Express` API.
- Containerized `Postgres` database.
- `redis` and `express-session` to handle session data and user authentication.
- `bcrypt` enabled to handle password hashing and comparison.
- Configured to run either in _development_ mode (API code runs locally, databse runs containerized) or _production_ mode (API and database both get containerized).
- Easy configuration script commands setup to re-scaffold your database, reset the containers, query the database and more,

## Table of Contents

1. [Components and Versioning](#components-and-versioning)
2. [Setup Guide](#setup-guide)
3. [Scripts](#scripts)
4. [Routes](#routes)
5. [Component Guides](#components)
    - [Docker](#docker)
    - [Postgres](#postgres)
    - [bcrypt](#bcrypt)
    - [Express Sessions and Redis](#express-and-redis) _(WIP)_
    - [Error Handling](#error-handling)

## Components and Versioning

|Package|Version|
|-------|-------|
|Node.js|24.19.0|
|Express.js|4.21.0|
|bcrypt|5.1.1|
|express-session|1.19.0|
|redis|6.2.1|
|connect-redis|10.0.0|
|pg|8.23.0|
|dotenv|16.4.5|

_The `docker image` for the container runs the same Node.js version, and currently `Postgres:16-alpine`_.

## Setup Guide

```txt
Before anything, be sure to have `Docker` and `Node.js` installed in your environment
```

Pull the repository to your local machine (using any method, `git clone` recommended).

Run the npm install using the following command...

```bash
npm install 
```

Create your own `.env` file, using the `!EXAMPLE.env` file as a start for the properties you need.

```env
//used by REDIS to sign the session cookie, can be anything
SECRET_KEY=my-secret-key

//Configuration for the postgres connection from your API to the container. You can change these to whatever you'd like, so long as you match what is configured in the docker-compose.yml db configuration.

DB_HOST=localhost
DB_PORT=5432
DB_NAME=devnodedb
DB_USER=devnodeadmin
DB_PASSWORD=devnodepassword

//The port you'd like this API to run on
PORT=9000
```

In the `Dockerfile`, you can configure the image that your API will run. This is used only in a production deployment, where the API is containerzied alongside the database. When developing locally, the configuration from your `.env` file will be used.

The `docker-compose.yml` contains the instructions for spinning up the API. In a local development scenario, only the `db` service container will run. In a production deployment, the `api` service container will run as well. They are configured to map to eachother in such a case through port `5432`. The environment variables in the `db` service must match the `api` service variables (in production), or the `.env` variables for local development. They can, however, be whatever you want them to be.

Finally spin up the project using the `npm run dev` command to run the API locally, and the `Postgres` database in a docker container. The configuration already establishes the connection between the API and DB.

```bash
npm run dev
```

## Scripts

The following scripts allow you to control the API and db efficiently from the terminal by abstracting commonly used, wordy bash commands. Simply run these in the root of your project directory. _Found in the `package.json`_.

`npm run start` - starts up the API only, runs the following command...

```bash
node app.js
```

`npm run dev` - starts up the API locally with _nodemon_ for auto restart on changes, and runs the docker container for the `db` service. Runs the following command...

```bash
docker compose up -d db && nodemon app.js
```

`npm run db:up` - starts up the containerized `db` service only. Runs the following command...

```bash
docker compose up -d db
```

`npm run db:down` - stops the `db` service by running the following command...

```bash
docker compose stop db
```

`npm run db:reset` - stops the `db` service, unmounts the data, rescaffolds the db, and spins the `db` service back up. Runs the following command...

```bash
docker compose down -v && docker compose up -d db
```

`npm run psql` - opens up the `psql` CLI for the database in the container, letting you SQL or modify the runing database via the terminal. You will need to change the user and database names appropriate to your configuration. Runs the following command...

```bash
docker compose esec db psql -U devnodeadmin -d devnodedb
```

## Routes

This example API only has routes for an example `users` table and simple CRUD operations. You can ofcourse expand, add and modify these however you'd like. Use this as a starting point to reference syntax, expected data structs and responses. Below is a short documented section about how each of the currently provided routes work.

### (GET) /users

Returns all users in the database that are not deleted (`is_deleted = false`)

#### Example Reponse Object

```json
[
    {
        "id": 1,
        "first_name": "Jane",
        "last_name": "Foster",
        "user_name": "jdfoster",
        "password": "",
        "email": "jane.foster@example.com",
        "date_created": "2026-08-27T00:16:48.694Z",
        "last_updated": "2026-08-27T00:16:48.694Z",
        "is_deleted": false
    },
    {
        "id": 3,
        "first_name": "Barrys",
        "last_name": "Bonds",
        "user_name": "thebarrybb88",
        "password": "",
        "email": "barrys.bonds@example.com",
        "date_created": "2026-08-27T00:16:48.694Z",
        "last_updated": "2026-08-27T00:16:48.694Z",
        "is_deleted": false
    }
]
```

Success Code: `200` | Failure Code: `500`

### (GET) users/:id

Returns a single user matching the parameter `:id` and not deleted (`is_deleted = false`)

#### Example Response Object

```json
{
    "id": 4,
    "first_name": "Harold",
    "last_name": "Foster",
    "user_name": "hryfoster",
    "password": "",
    "email": "harold.foster@example.com",
    "date_created": "2026-08-27T00:16:48.694Z",
    "last_updated": "2026-08-27T00:16:48.694Z",
    "is_deleted": false
}
```

Success Code: `200` | Failure Code: `500`

### (PUT) users/

Adds a new user to the database, automatically incrementing `id` and hashing the password. It accepts a `json` body with the following fields.

```json
{
    "firstName": "",
    "lastName": "",
    "userName": "",
    "password": "",
    "email": ""
}
```

If any fields are missing or empty, it will return a `400` code. If the `email` or `username` fields are not unique to the table, it will return a `409` code. Any other errors will return a `500`.

#### Example Response Object

```json
{
    "id": 5,
    "first_name": "Carmen",
    "last_name": "Santiago",
    "user_name": "crmsantiago",
    "email": "c.santiago@gmail.com"
}
```

Success Code: `201` | Failure Code: `400, 409, 500`

### (PATCH) users/:id

Updates a user on the database of a given id. It will accept a JSON object with any combination of the following fields below. If no valid fields are found, or a provided field has no value, it will send a `400` code.

```json
{
    "email": "",
    "firstName": "",
    "lastName": "",
    "userName": ""
}
```

#### Example Response Object

```json
{
    "id": 4,
    "first_name": "Harold",
    "last_name": "Foster",
    "user_name": "hryfoster",
    "email": "ctier@example.com",
    "last_updated": "2026-08-27T06:36:49.122Z"
}
```

Success Code: `200` | Failure Code: `400`

### (PATCH) users/:id/update-password

Updates the password of the given user matching the `id` parameter. It accepts a JSON with the `newPassword` and `currentPassword` fields. If any of those fields are missing, it will send a `400` code. An example expected JSON object is shown below. This route will call the model to automatically compare and generate hashes. Returns an empty object on success.

```json
{
    "currentPassword": "spartan24",
    "newPassword": "spartan25"
}
```

#### Example Response Object

```json
(empty)
```

Success Code: `204` | Failure Code: `400, 500`

### (DELETE) users/delete/:id

Sets the `is_deleted` flag on the specified user of `id` to `true`. Does not actually remove the user from the database. Sends an empty object on success.

#### Example Response Object

```json
(empty)
```

Success Code: `204` | Failure Code: `500`

## Components

### Docker

Docker is the app that is required to spin up the containers on source code startup, both for producton or local development. When the app is started, it will use Docker to spin up a separate environment where the `Postgres` db will function. This means you do not need to install a separate `Postgres` environment on your local machine. Docker MUST be installed on your local machine for this app to run.

The `dockerfile` is only used for production deployments, and crestes a `node` environment to host the API. The database is hosted in a separate environment/container that is configured to connect directly to the `node` environment, local or production.

The `docker-compose` builds the two containers that host the API and Database. When running in development (`npm run dev`), only the database container spins up, and your local environment will run the API.

### Postgres

The database image runs a `Postgres` db, the industry standard when handling relational data. You can customize this app to use a different database depending on your needs (`MySQL` for small web apps for example), by changing the source code and docker files accordingly.

### bcrypt

A node library responsible for hashing passwords with a Blowfish cypher. It is the widely accepted industry standard encyrption cypher. Its basic functionality is abstracted by the functions in the `helpers/bcryptHelpers.js`. The `comparePassword` function takes in an unhashed `password1` and compares it to a hashed `password2` to check equivalence. The `hashPassword` function accepts an unhashed password and returns it hashed by 10 rounds (which you can change).

### Error Handling

In order to better maintain error handling, the `sendError` provides an easy way to send appropriate error codes and mesages.

```javascript
export const sendError = (res, errorCode, customMessage = null) => {
  //Find the configuration or default to a standard 500 server error
  const errorConfig = ALL_ERRORS[errorCode] || SYS_ERROR_CODES.SERVER_ERROR;
  
  return res.status(errorConfig.status).json({
    status: errorConfig.status >= 500 ? 'error' : 'fail',
    code: errorCode || 'INTERNAL_SERVER_ERROR',
    message: customMessage || errorConfig.message
  });

};
```

`errorCode` references the codes imported from the `constants` folder. This allows you to create custom error objects for different scenarios. By passing in the `errorCode` you create, the function will pick up the associated code and message from the objects that are imported at the top of the `errorHelpers.js` file.

```javascript
import { USER_ERROR_CODES } from '../constants/userErrors.js';
import { SYS_ERROR_CODES } from '../constants/systemErrors.js';

const ALL_ERRORS = { ...USER_ERROR_CODES, ...SYS_ERROR_CODES };
```

If it fails to find any code, it will just send the default `INTERNAL_SERVER_ERROR | 500` code.
