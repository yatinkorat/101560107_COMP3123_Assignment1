# COMP3123 Assignment 1 — Employee Management API

## Description
A RESTful Employee Management API built using Node.js, Express.js, and MongoDB Atlas. The API supports user registration, JWT authentication, and employee CRUD operations with user ownership protection.

## Technologies
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Helmet
- express-rate-limit

## Requirements
- Node.js and npm
- MongoDB Atlas account
- Postman for API testing

## Installation and Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yatinkorat/COMP3123_Assignment1.git
   cd COMP3123_Assignment1
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root using `.env.example` as a template.

4. Set the following environment variables:

   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_long_random_secret
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

The local API runs at `http://localhost:3000`.

## API Endpoints

### General
- `GET /` — API status
- `GET /health` — API and database health status

### User
- `POST /api/v1/user/signup` — Register a new user
- `POST /api/v1/user/login` — Log in and receive a JWT

### Employee
All employee endpoints require a valid JWT Bearer token.

- `GET /api/v1/emp/employees` — Retrieve employees belonging to the authenticated user
- `POST /api/v1/emp/employees` — Create an employee
- `GET /api/v1/emp/employees/:eid` — Retrieve an employee by ID
- `PUT /api/v1/emp/employees/:eid` — Update an employee
- `DELETE /api/v1/emp/employees?eid=:eid` — Delete an employee

## Authentication
1. Register using the signup endpoint.
2. Log in using the login endpoint.
3. Copy the JWT from the response.
4. In Postman, select **Authorization → Bearer Token** and enter the token for employee requests.

Users can access only their own employee records. Attempts to access another user's employee by ID return `404 Not Found`.

## Security and Monitoring
- Passwords are hashed before storage.
- JWT middleware protects employee endpoints.
- Helmet adds HTTP security headers.
- Rate limiting restricts excessive API requests.
- The `/health` endpoint reports database connectivity.
- Database connection errors are logged by the server.

## Testing
Import `COMP3123_Assignment 1.postman_collection.json` into Postman to test the API endpoints, authentication, employee CRUD operations, validation, and error responses.

## Deployment
Deployed API: https://comp-3123-assignment1.vercel.app

## Environment and Submission Notes
- `.env.example` provides the required environment variable names.
- Never commit the real `.env` file or expose database credentials and JWT secrets.
- Do not include `node_modules` in the submission ZIP.
- Use non-sensitive test credentials when demonstrating the API.

## Sample Credentials for Marking

Use the following test account to test the deployed API:

- Email: `ownership.userb01@example.com`
- Password: `TestPass456!`

Log in through `POST /api/v1/user/login` to obtain a JWT. Use the token as a Bearer token for employee endpoints.