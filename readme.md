# Jobly Backend
Jobly is a job board for viewing job postings and the companies that are posting them. 

## Description
The Jobly backend is built using [Express](https://expressjs.com/). Querying is done directly with [PostgreSQL](https://www.postgresql.org/). The primary purpose of the app is to explore using middleware for user authorization and PSQL directly (as opposed to an ORM). 

## Routes
The API is built using RESTful patterns, as follows:

Authorization:
* POST /auth/register - creates a user in the backend and returns a user token. JSON body must include "username", "password", "firstName", "lastName", "email".
* POST /auth/token - provides authorization token for previously registered user. JSON body must include "authorization", whose value is the token

Companies:
* GET /companies/ - provides all companies listed. Can optionally include filters to limit the results ("minEmployees", "maxEmployees", "nameLike")
* POST /companies/ - adds new companies to the list if an admin token is provided in "authorization". Requires "handle", "name", "description", "numEmployees", "logoUrl" in the body
* GET /companies/<handle> - provides information about listed company
* PATCH /companies/<handle> - allows one to edit information about a company assuming admin token provided
* DELETE /companies/<handle> - allows deleting a company record assuming admim token is provided
    
Jobs:
* GET /jobs/ - gets all jobs. Can optionally filter on "minSalary", "hasEquity", "title"
* POST /jobs/ - creates a job assuming admin token provided. Requires "title", "salary", "equity", "companyHandle"
* GET /jobs/<id> - gets information on individual job
* PATCH /jobs/<id> - edits information on individual job assuming admin token provided. Can edit "title", "salary", "equity"
* DELETE /jobs/<id> - deletes a job assuming admin token provided
    
Users:
* GET /users/ - provides list of all users assuming admin token
* POST /users/ - creates user assuming admin token provided. Requires {user: { username, firstName, lastName, email, isAdmin }, token }
* GET /users/<username> - provides information on individual user assuming either admin or same user token provided
* PATCH /users/<username> - edits user assuming assuming either admin or same user token provided. Can edit firstName, lastName, password, email
* DELETE /users/<username> - deletes user assuming either admin or same user token provided
* POST /users/<username>/jobs/<id> - applies to a job for the specified user assuming either admin or same user token provided

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
