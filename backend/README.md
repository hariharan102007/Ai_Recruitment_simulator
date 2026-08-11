# MERN Backend

Backend API for the MERN Interview Preparation Platform built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Registration and login with JWT
- **Aptitude Tests**: Create, read, update, and delete aptitude tests
- **Coding Problems**: Manage coding challenges with test cases
- **Progress Tracking**: Track user performance and progress
- **Leaderboard**: View top performers
- **Role-based Access**: Support for admin and instructor roles

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-project
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/users` - Get all users (admin only)

### Aptitude Tests
- `GET /api/aptitude` - Get all published aptitude tests
- `GET /api/aptitude/:id` - Get specific aptitude test
- `POST /api/aptitude` - Create new aptitude test (instructor/admin)
- `PUT /api/aptitude/:id` - Update aptitude test
- `DELETE /api/aptitude/:id` - Delete aptitude test
- `POST /api/aptitude/:id/publish` - Publish aptitude test

### Coding Problems
- `GET /api/coding` - Get all coding problems
- `GET /api/coding/:id` - Get specific coding problem
- `POST /api/coding` - Create new coding problem (instructor/admin)
- `PUT /api/coding/:id` - Update coding problem
- `DELETE /api/coding/:id` - Delete coding problem
- `POST /api/coding/:id/publish` - Publish coding problem

### Progress & Analytics
- `POST /api/progress/submit` - Submit test results
- `GET /api/progress` - Get user progress
- `GET /api/progress/stats/user` - Get user statistics
- `GET /api/progress/leaderboard` - Get leaderboard

## Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   ├── User.js               # User model
│   ├── Aptitude.js           # Aptitude test model
│   ├── CodingProblem.js      # Coding problem model
│   ├── UserProgress.js       # User progress model
│   └── Interview.js          # Interview model
├── controllers/
│   ├── authController.js     # Auth logic
│   ├── aptitudeController.js # Aptitude logic
│   ├── codingController.js   # Coding logic
│   └── progressController.js # Progress logic
├── routes/
│   ├── authRoutes.js         # Auth routes
│   ├── aptitudeRoutes.js     # Aptitude routes
│   ├── codingRoutes.js       # Coding routes
│   └── progressRoutes.js     # Progress routes
├── middleware/
│   ├── auth.js               # Authentication middleware
│   └── errorHandler.js       # Error handling middleware
├── utils/
│   └── validators.js         # Validation helpers
├── .env.example              # Environment variables template
├── server.js                 # Main server file
└── package.json              # Dependencies
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/mern-project |
| JWT_SECRET | JWT secret key | your_jwt_secret_key_here |
| NODE_ENV | Environment | development |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |

## Database Setup

### Local MongoDB
```bash
# Make sure MongoDB is running
mongod
```

### MongoDB Atlas
1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in `.env`

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": {}
}
```

## Authentication

The API uses JWT for authentication. Include the token in headers:

```bash
Authorization: Bearer <your_jwt_token>
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

ISC
