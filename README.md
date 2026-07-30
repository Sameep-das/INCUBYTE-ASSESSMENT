# Car Dealership Platform

A full-stack car dealership application where users can browse inventory publicly, sign up to purchase vehicles, and admins can manage inventory and dashboard metrics.

## Project Link

[https://car-dealership.vercel.app/](https://car-dealership.vercel.app/)

## Project Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/Sameep-das/INCUBYTE-ASSESSMENT.git
cd INCUBYTE-ASSESSMENT
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
FRONTEND_URL="http://localhost:3000"
PORT=2121
NODE_ENV=DEVELOPMENT
JWT_SECRET_ACCESS_TOKEN="replace-with-at-least-32-characters"
JWT_SECRET_REFRESH_TOKEN="replace-with-at-least-32-characters"
ADMIN_NAME="Admin Name"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD_HASH="bcrypt-hashed-admin-password"
```

Run the backend:

```bash
npm run dev
```

### Drizzle and Database Migrations

The backend uses Drizzle ORM with PostgreSQL.

Generate migrations after schema changes:

```bash
cd backend
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

Run backend tests:

```bash
npm test
npm run test:coverage
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend`:

```env
BACKEND_API_URL="http://localhost:2121"
```

Run the frontend:

```bash
npm run dev
```

The frontend server runs on `http://localhost:3000` by default and proxies `/api/*` requests to the backend.

Build the frontend:

```bash
npm run build
npm start
```

## UNDERSTANDING THE PROJECT


1. I have simulated a LOCK on purchase for concurrent requests on same car.
2. I have also implemented a LOCK on a specfic car when the car is getting updated by the admin.

![DESIGN](./project-design-architecture/System-Design_initial.svg)

## Project Test Report


![COVERAGE-1](./project-design-architecture/Coverage_report1.png)

![COVERAGE-2](./project-design-architecture/Coverage_report2.png)

![TEST-1](./project-design-architecture/Test1.png)

![TEST-2](./project-design-architecture/Test2.png)

![TEST-3](./project-design-architecture/Test3.png)


## DEMO -

![HOME](./project-design-architecture/HOME-PAGE.png)

![SIGNUP](./project-design-architecture/SIGN-UP-MODAL.png)

![MAIN](./project-design-architecture/MAIN-PAGE.png)

![ADMIN](./project-design-architecture/ADMIN%20DASHBOARD.png)

![BOOKMARKS](./project-design-architecture/BOOKMARKS.png)

![UPDATECAR](./project-design-architecture/ADD-VEHICEL-ADMIN.png)

## API Documentation

Base URL for local backend:

```text
http://localhost:2121
```

All API responses use a JSON structure with `success`, `message` where applicable, and `data` for returned payloads.

### Authentication Flow

#### Register User

```http
POST /api/auth/register
```

Creates a user account, stores a refresh token in an HTTP-only cookie, and returns an access token.

Request body:

```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "Password@123",
  "city": "Delhi",
  "pinCode": "110001",
  "state": "Delhi",
  "houseNumber": "123",
  "phone": "9876543210"
}
```

Flow:

1. Validates the request body.
2. Checks whether the email already exists.
3. Hashes the password.
4. Creates the user and stores the refresh token.
5. Returns user details and an access token.

#### Login User

```http
POST /api/auth/login
```

Authenticates an existing user and returns a new access token.

Request body:

```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

Flow:

1. Validates login credentials.
2. Checks the user by email.
3. Compares the password hash.
4. Rotates refresh-token storage.
5. Returns user details and an access token.

#### Logout User

```http
POST /api/auth/logout
```

Requires a user access token and CSRF protection. Deletes the stored refresh token and clears the refresh-token cookie.

#### Refresh Token

```http
POST /api/auth/refresh
```

Uses the refresh-token cookie to issue a new access token and rotate the refresh token.

### Public Car Flow

#### Get All Cars

```http
GET /api/cars
```

Returns all available cars. No signup or login is required.

Supported query filters:

```text
make
model
category
minPrice
maxPrice
```

Example:

```http
GET /api/cars?make=Toyota&category=SEDAN&minPrice=100000&maxPrice=3000000
```

Flow:

1. Reads optional filters from query parameters.
2. Validates price range and category.
3. Returns matching inventory records.

#### Get Car by ID

```http
GET /api/cars/:id
```

Returns a single car by id. No signup or login is required.

Flow:

1. Reads the car id from the route.
2. Checks whether the car is under maintenance.
3. Returns the car record or an error if it does not exist.

#### Get Car Filter Options

```http
GET /api/cars/filters
```

Returns car categories and manufacturer names for frontend filter dropdowns.

Response data shape:

```json
{
  "categories": ["SUV", "HATCHBACK", "SEDAN"],
  "makes": ["Honda", "Toyota"]
}
```

#### Purchase Car

```http
POST /api/cars/:id/purchase
```

Requires user login.

Headers:

```http
Authorization: Bearer <user-access-token>
```

Flow:

1. Authenticates the user access token.
2. Resolves the logged-in user from the token email.
3. Checks car existence and maintenance status.
4. Reserves one unit to avoid concurrent over-purchase.
5. Decrements car quantity if stock is available.
6. Persists a new order in the orders table.
7. Releases the reservation and returns order details.

### Admin Authentication Flow

#### Admin Login

```http
POST /api/admin/login
```

Authenticates the admin using configured environment credentials.

Request body:

```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "admin-password"
}
```

Flow:

1. Validates required admin credentials.
2. Compares name and email with environment variables.
3. Compares password with `ADMIN_PASSWORD_HASH`.
4. Returns an admin access token.

#### Admin Logout

```http
POST /api/admin/logout
```

Requires admin authentication. Clears the refresh-token cookie.

### Admin Car Management Flow

All admin car routes require:

```http
Authorization: Bearer <admin-access-token>
```

#### Get All Cars for Admin

```http
GET /api/admin/cars
```

Returns all car records for admin inventory management.

#### Get Admin Car by ID

```http
GET /api/admin/cars/:id
```

Returns a single car record for admin management.

#### Create Car

```http
POST /api/admin/cars
```

Request body:

```json
{
  "carModel": "Corolla",
  "carMake": "Toyota",
  "quantity": 10,
  "price": 2500000,
  "category": "SEDAN",
  "yearOfManufacturing": 2024
}
```

Flow:

1. Authenticates admin token.
2. Validates car payload.
3. Checks for duplicate model.
4. Inserts the car record.
5. Returns created car details.

#### Update Car

```http
PUT /api/admin/cars/:id
```

Accepts partial car fields and updates the matching record.

Flow:

1. Authenticates admin token.
2. Validates update payload.
3. Checks whether the car is under maintenance.
4. Updates provided fields.
5. Returns updated car id.

#### Delete Car

```http
DELETE /api/admin/cars/:id
```

Deletes a car record.

Flow:

1. Authenticates admin token.
2. Checks whether the car is under maintenance.
3. Deletes the matching car record.
4. Returns deleted car id.

#### Restock Car

```http
POST /api/admin/cars/:id/restock
```

Request body:

```json
{
  "quantity": 15
}
```

Flow:

1. Authenticates admin token.
2. Validates the new quantity.
3. Updates car quantity.
4. Starts a temporary maintenance window for that car.
5. Returns updated car details.

### Admin Dashboard Metrics Flow

All admin stats routes require:

```http
Authorization: Bearer <admin-access-token>
```

#### Get Dashboard Stats

```http
GET /api/admin/stats/dashboard
```

Returns both dashboard chart datasets.

Response data shape:

```json
{
  "salesByMake": [
    {
      "make": "Toyota",
      "ordersCount": 3,
      "totalRevenue": 7500000
    }
  ],
  "topModels": [
    {
      "model": "Corolla",
      "ordersCount": 5
    }
  ]
}
```

Flow:

1. Authenticates admin token.
2. Aggregates order count and revenue grouped by manufacturer.
3. Aggregates the top 10 ordered car models.
4. Returns both datasets for dashboard charts.

#### Get Sales by Make

```http
GET /api/admin/stats/sales-by-make
```

Returns data for the horizontal bar chart showing car sales by manufacturer.

#### Get Top Car Models

```http
GET /api/admin/stats/top-models
```

Returns data for the line chart showing the top 10 car models by order count.

## Author

Sameep Das
