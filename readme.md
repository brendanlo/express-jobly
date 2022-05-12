# Jobly Backend
Jobly is a job board for viewing job postings and the companies that are posting them. 

## Description
The Jobly backend is built using [Express](https://expressjs.com/). Querying is done directly with [PostgreSQL](https://www.postgresql.org/). The primary purpose of the app is to explore using middleware for user authorization and PSQL directly (as opposed to an ORM). 

## Getting Started
Dependencies:
* bcrypt@5.0.1
* body-parser@2.0.0-beta.1
* colors@1.4.0
* cors@2.8.5
* dotenv@16.0.0
* express@5.0.0-beta.1
* jsonschema@1.4.0
* jsonwebtoken@8.5.1
* morgan@1.10.0
* pg@8.7.3
* supertest@6.2.2

To install dependencies:
    npm install

To run Express server:

    node server.js
    
To run the tests:

    jest -i
