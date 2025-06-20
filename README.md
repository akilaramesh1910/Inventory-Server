# Inventory Management System - Backend

## Description

This is the backend component for a simple Inventory Management System. It provides the necessary APIs and database interactions to manage inventory data.

## Technologies Used

*   **Node.js:** JavaScript runtime environment.
*   **Express:** Fast, unopinionated, minimalist web framework for Node.js.
*   **Mongoose:** MongoDB object modeling tool designed to work in an asynchronous environment.
*   **bcryptjs:** Library for hashing passwords.
*   **jsonwebtoken:** Implementation of JSON Web Tokens for authentication.
*   **cors:** Middleware to enable Cross-Origin Resource Sharing.
*   **dotenv:** Loads environment variables from a `.env` file.
*   **morgan:** HTTP request logger middleware.
*   **bwip-js:** Barcode rendering library.
*   **nodemon:** Tool that helps develop Node.js applications by automatically restarting the node application when file changes are detected.

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd server
    ```
2.  Install the dependencies:
    ```bash
    node version v23
    npm install
    # or using yarn:
    # yarn install
    ```

## Configuration

Create a `.env` file in the `server` directory. This file will contain your environment-specific variables, such as database connection strings and secrets.

```dotenv
# Example .env file content
# Replace with your actual values
MONGO_URI=mongodb://localhost:27017/inventory_db
JWT_SECRET=your_jwt_secret_key
PORT=5000
