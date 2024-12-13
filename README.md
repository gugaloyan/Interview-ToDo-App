# TODO App with NestJS, Prisma, and MySQL

## Description

This is a simple **TODO application** built using **NestJS**, **Prisma ORM**, and **MySQL**. The application allows users to register, log in, and manage their tasks (todos). It utilizes **JWT (JSON Web Tokens)** for authentication.

This project follows modern backend development best practices and includes **unit tests**, **Postman collection** for testing the API, and **docker** configurations for easy deployment.

## Features

- **User Authentication**:
  - User registration (`POST /auth/register`)
  - User login (`POST /auth/login`) with JWT token generation.

- **Task Management**:
  - Create a TODO (`POST /todos`)
  - List all TODOs for a user (`GET /todos/:userId`)

- **User Management**:
  - Fetch all users in the system (`GET /user`)

## Tech Stack

- **Backend Framework**: [NestJS](https://nestjs.com/)
- **Database**: [MySQL](https://www.mysql.com/) (managed with [Prisma ORM](https://www.prisma.io/))
- **Authentication**: [JWT](https://jwt.io/) for secure user login and session management
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Password Hashing**: [bcrypt](https://www.npmjs.com/package/bcrypt)
- **Testing**: [Jest](https://jestjs.io/)
- **Environment Variables**: `@nestjs/config` for loading configuration settings

## Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (local instance or Docker)
- **npm** (or **yarn**)
- **Docker** (optional for deployment)

## Setup and Installation

### Step-by-Step Setup

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/Todo-App-NestJS-Prisma-MySQL.git
    cd Todo-App-NestJS-Prisma-MySQL
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up the `.env` file**:
  - Create a `.env` file in the root of the project and add the following environment variables:
    ```env
    DATABASE_URL="mysql://root:password@localhost:3306/todoapp"
    JWT_SECRET="your-secure-jwt-secret-key"
    ```
  - Replace `password` with your MySQL root password and set a secure `JWT_SECRET` key.

4. **Run Prisma Migrations**:
    ```bash
    npx prisma migrate dev
    ```

5. **Start the Application**:
    ```bash
    npm run start:dev
    ```

   The application will now be running on `http://localhost:3000`.

---

## Working with Docker Compose

You can run the application with **Docker Compose** to easily set up both the backend application and the MySQL database.

### Step 1: **Create a `docker-compose.yml` File**

Below is the `docker-compose.yml` file that sets up the **MySQL** database:

```yaml
version: '3.9'

services:
  mysql:
    image: mysql:8.0
    container_name: todoapp-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:

```
** Running Docker Compose**:
```bash
docker-compose up --build
```