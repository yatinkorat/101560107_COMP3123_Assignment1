# COMP3123 Assignment 1

## Description
This project is an Employee Management API built using Node.js, Express, and MongoDB Atlas.

## Requirements
- Node.js
- MongoDB Atlas

## How to Run

1. Install the required packages:

   `npm install`

2. Create a `.env` file with your MongoDB connection string and JWT secret.

3. Start the application:

   `npm run dev`

4. Open `http://localhost:3000` in your browser.

## API Endpoints

### User
- `POST /api/v1/user/signup` — Create a user account
- `POST /api/v1/user/login` — Log in

### Employee
- `GET /api/v1/emp/employees` — Get all employees
- `POST /api/v1/emp/employees` — Create an employee
- `GET /api/v1/emp/employees/:eid` — Get an employee by ID
- `PUT /api/v1/emp/employees/:eid` — Update an employee
- `DELETE /api/v1/emp/employees?eid=xxx` — Delete an employee

## Notes
- User passwords are hashed before being saved.
- Database credentials are stored in `.env`.
- The `.env` and `node_modules` folders should not be uploaded to GitHub.
