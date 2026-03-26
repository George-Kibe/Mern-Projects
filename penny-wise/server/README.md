# PennyWise — Backend (Server)

A REST API built with Express 5, TypeScript, MongoDB, and JWT authentication. The server handles all business logic, database operations, file uploads, and serves analytics data to the PennyWise frontend client.

## Technologies Used

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Node.js      | 18+     | Runtime environment             |
| Express      | 5       | Web framework                   |
| TypeScript   | 5.9     | Type safety                     |
| MongoDB      | 6+      | NoSQL database                  |
| Mongoose     | 9       | MongoDB object modeling         |
| jsonwebtoken | 9       | JWT generation and verification |
| bcryptjs     | 3       | Password hashing                |
| Multer       | 2       | Avatar file upload handling     |
| CORS         | 2.8     | Cross-origin resource sharing   |
| dotenv       | 17      | Environment variable management |
| tsx          | 4       | TypeScript execution            |
| nodemon      | 3       | Hot reloading in development    |

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) — [Installation Guide](https://www.youtube.com/watch?v=gB6WLkSrtJk)
- **npm** or **yarn**

## Getting Started

### 1. Navigate to the Server Directory

```bash
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=8000
MONGODBURI=mongodb://localhost:27017/pennywise
JWT_SECRET=your-secure-jwt-secret-key
NODE_ENV=development
```

### 4. Start MongoDB

Make sure your MongoDB instance is running locally on port `27017`. You can verify the connection using the test script:

```bash
npx tsx src/mongoDBTestConnection.ts
```

### 5. Start the Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:8000`

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.ts                      # MongoDB connection setup
│   ├── controllers/
│   │   ├── analyticsControllers.ts    # Analytics route handlers
│   │   ├── authControllers.ts         # Signup and login handlers
│   │   ├── expenseControllers.ts      # Expense CRUD handlers
│   │   └── profileControllers.ts      # Profile, avatar, export, delete handlers
│   ├── middleware/
│   │   ├── authMiddleware.ts          # JWT verification — protects routes
│   │   ├── errorHandler.ts            # Global error handler and AppError class
│   │   └── upload.ts                  # Multer config for avatar uploads
│   ├── models/
│   │   ├── Expense.ts                 # Mongoose Expense model
│   │   └── User.ts                    # Mongoose User model
│   ├── routes/
│   │   ├── analyticsRoutes.ts         # /api/analytics routes
│   │   ├── authRoutes.ts              # /api/auth routes
│   │   ├── expenseRoutes.ts           # /api/expenses routes
│   │   └── profileRoutes.ts           # /api/profile routes
│   ├── types/
│   │   └── index.ts                   # Shared TypeScript types and interfaces
│   ├── utils/
│   │   ├── responseHelpers.ts         # sendSuccess and asyncHandler helpers
│   │   └── tokenHelpers.ts            # JWT generation utility
│   ├── index.ts                       # Express app entry point
│   └── mongoDBTestConnection.ts       # Standalone MongoDB connection test script
├── uploads/
│   └── avatars/                       # Stored user avatar images
├── .env                               # Environment variables
├── .gitignore
├── nodemon.json                       # Nodemon config for hot reloading
├── package.json
├── README.md
└── tsconfig.json
```

## API Endpoints

### Public Routes

| Method | Endpoint           | Description                   |
| ------ | ------------------ | ----------------------------- |
| GET    | `/`                | Health check                  |
| POST   | `/api/auth/signup` | Register a new user           |
| POST   | `/api/auth/login`  | Login and receive a JWT token |

### Expense Routes (Protected)

All requests to `/api/expenses` require a valid JWT token.

| Method | Endpoint            | Description                                           |
| ------ | ------------------- | ----------------------------------------------------- |
| GET    | `/api/expenses`     | Get all expenses (supports `?category=` and `?sort=`) |
| GET    | `/api/expenses/:id` | Get a single expense by ID                            |
| POST   | `/api/expenses`     | Create a new expense                                  |
| PUT    | `/api/expenses/:id` | Update an expense by ID                               |
| DELETE | `/api/expenses/:id` | Delete an expense by ID                               |

**Supported query parameters for `GET /api/expenses`:**

| Parameter  | Values                                                                                            | Description        |
| ---------- | ------------------------------------------------------------------------------------------------- | ------------------ |
| `category` | `food`, `transport`, `utilities`, `entertainment`, `healthcare`, `shopping`, `education`, `other` | Filter by category |
| `sort`     | `date`, `-date`, `amount`, `-amount`                                                              | Sort results       |

### Profile Routes (Protected)

| Method | Endpoint               | Description                                    |
| ------ | ---------------------- | ---------------------------------------------- |
| GET    | `/api/profile`         | Get current user profile                       |
| PUT    | `/api/profile`         | Update name, email, or password                |
| POST   | `/api/profile/avatar`  | Upload a profile picture (multipart/form-data) |
| GET    | `/api/profile/avatar`  | Get profile picture file                       |
| DELETE | `/api/profile/avatar`  | Delete profile picture                         |
| DELETE | `/api/profile/account` | Permanently delete account and all expenses    |
| GET    | `/api/profile/export`  | Export all user data and expenses as JSON      |

### Analytics Routes (Protected)

| Method | Endpoint                                 | Description                                                          |
| ------ | ---------------------------------------- | -------------------------------------------------------------------- |
| GET    | `/api/analytics/dashboard`               | Total, count, average, current month, last month, and monthly change |
| GET    | `/api/analytics/category`                | All-time spending totals grouped by category                         |
| GET    | `/api/analytics/trends`                  | Monthly spending totals for the last 6 months                        |
| GET    | `/api/analytics/period?days=`            | Category breakdown for a custom number of past days                  |
| GET    | `/api/analytics/current-month`           | Category breakdown for the current calendar month                    |
| GET    | `/api/analytics/monthly?year=`           | Monthly totals for a specific year                                   |
| GET    | `/api/analytics/yearly-categories?year=` | Monthly category breakdown for a specific year                       |
| GET    | `/api/analytics/all-years`               | Total spending and count grouped by year                             |

## Authorization

All protected routes require a valid JWT Bearer token in the request header:

```
Authorization: Bearer <your_token>
```

The token is returned in the response body on a successful `/api/auth/login` request and expires after **7 days**.

On an invalid or expired token the server responds with:

```json
{
  "success": false,
  "error": "Invalid token. Please log in again."
}
```

## Request & Response Examples

### POST `/api/auth/signup`

**Request body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account created successfully!",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

### POST `/api/expenses`

**Request body:**

```json
{
  "amount": 49.99,
  "category": "food",
  "description": "Weekly groceries",
  "date": "2026-03-15"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Expense created successfully!",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "amount": 49.99,
    "category": "food",
    "description": "Weekly groceries",
    "date": "2026-03-15T00:00:00.000Z",
    "createdAt": "2026-03-15T10:00:00.000Z",
    "updatedAt": "2026-03-15T10:00:00.000Z"
  }
}
```

## Database Schema

### Users Collection

```
{
  _id:       ObjectId,
  name:      String,
  email:     String (unique, lowercase),
  password:  String (bcrypt hashed),
  avatar:    String (optional, stored filename),
  createdAt: Date,
  updatedAt: Date
}
```

### Expenses Collection

```
{
  _id:         ObjectId,
  userId:      ObjectId (ref: User),
  amount:      Number,
  category:    String (food | transport | utilities | entertainment | healthcare | shopping | education | other),
  description: String,
  date:        Date,
  createdAt:   Date,
  updatedAt:   Date
}
```

## Validation Rules

### Auth

| Field      | Rules                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| `name`     | Required, 2–50 characters                                                                                |
| `email`    | Required, valid email format                                                                             |
| `password` | Required, min 8 characters, must contain uppercase, lowercase, number, and special character (`@$!%*?&`) |

### Expenses

| Field         | Rules                                                     |
| ------------- | --------------------------------------------------------- |
| `amount`      | Required, must be a number, greater than 0, max 1,000,000 |
| `category`    | Required, must be one of the 8 valid categories           |
| `description` | Required, 3–100 characters                                |
| `date`        | Optional, cannot be a future date                         |

### Avatar Upload

| Rule             | Value                        |
| ---------------- | ---------------------------- |
| Accepted formats | JPEG, JPG, PNG               |
| Max file size    | 5MB                          |
| Storage location | `uploads/avatars/`           |
| Filename format  | `{userId}-{timestamp}.{ext}` |

## Error Handling

All errors are handled globally by `src/middleware/errorHandler.ts`. Every error response follows the same structure:

```json
{
  "success": false,
  "error": "Error message here"
}
```

| Error Type                 | Status Code |
| -------------------------- | ----------- |
| Validation error           | 400         |
| Duplicate key (e.g. email) | 400         |
| Invalid MongoDB ID         | 400         |
| Unauthorized               | 401         |
| Invalid / expired JWT      | 401         |
| Forbidden (wrong user)     | 403         |
| Not found                  | 404         |
| Server error               | 500         |

## Available Scripts

| Script        | Description                                             |
| ------------- | ------------------------------------------------------- |
| `npm run dev` | Start development server with hot reloading via nodemon |

---

Happy Coding and Learning! 🙂
