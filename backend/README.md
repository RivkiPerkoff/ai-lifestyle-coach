# AI Lifestyle Coach - Backend

Node.js backend API for the AI Lifestyle Coach application.

## Features

- User authentication (JWT)
- Profile management with BMI calculation
- Gemini AI integration for personalized plans
- Google Calendar API integration (planned)
- MongoDB data persistence

## Setup

### Prerequisites
- Node.js 18+
- MongoDB
- Gemini API key

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your API keys
```

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MONGODB_URI=mongodb://localhost:27017/ai-lifestyle-coach
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Running

```bash
# Development
npm run dev

# Production
npm start

# Tests
npm test

# Test with coverage
npm run test:coverage
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile (onboarding)

### Plans
- `POST /api/plans/generate` - Generate AI wellness plan

## Architecture

```
src/
├── controllers/    # Request handlers
├── models/        # MongoDB schemas
├── routes/        # API routes
├── middleware/    # Auth, validation
├── services/      # External APIs (Gemini, Google)
├── utils/         # Database, helpers
└── server.js      # Entry point
```